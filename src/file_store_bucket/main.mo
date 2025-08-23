import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Iter "mo:base/Iter";

import Batch "Batch";
import U "Utils";

persistent actor {

	type BatchId = Nat;
	type Result<Ok, Err> = Result.Result<Ok, Err>;
	type FileName = Text;

	type Batch = Batch.Batch;

	type Buffer<T> = Buffer.Buffer<T>;
	type HashMap<K, V> = HashMap.HashMap<K, V>;

	type File = {
		modified : Nat64;
		contentType : Text;
		content : [Blob];
		sha256 : ?Blob;
	};

	type BatchArg = {
		chunksSha256 : [Blob];
		name : Text;
		contentType : Text;
		sha256 : ?Blob;
	};

	type UploadChunkArg = {
		batchId : Nat;
		chunk : Blob;
	};

	type FileInfo = {
		file_name : FileName;
		modified : Nat64;
		content_type : Text;
		sha256 : ?Blob;
		size : Nat;
		nos_chunks : Nat;
	};
	// type Batch = {
	//   uploader : Principal;
	//   chunksSha256 : [Blob];
	//   name : Text;
	//   contentType : Text;
	//   sha256 : Blob;
	//   chunks : [Blob];
	//   timerId : Nat;
	//   expiresAt : Time.Time;
	//   refreshExpiry : () -> ();
	//   addChunk : (chunk : Blob) -> ();
	// };

	var persistedUserRegisrty : [Principal] = []; // stable by default in persistent actor
	var persistedFilesStored : [(Text, File)] = []; // stable by default in persistent actor
	var nextBatchId : Nat = 1; // stable by default in persistent actor

	transient let admin : Principal = Principal.fromText("6lzil-lzkgm-twmv5-rz5xg-a5nnm-togvj-mlu6s-p4xyl-5j3zi-6a6jy-yqe");

	transient let backend : Principal = Principal.fromText("uxrrr-q7777-77774-qaaaq-cai");

	transient var usersRegistry : Buffer<Principal> = Buffer.Buffer<Principal>(0); // class are non-stable by default so we need to make them transient
	transient var filesStored : HashMap<Text, File> = HashMap.HashMap<Text, File>(1, Text.equal, Text.hash); // class are non-stable by default so we need to make them transient
	transient var batches : HashMap<BatchId, Batch> = HashMap.HashMap<BatchId, Batch>(3, Nat.equal, U.natHash); // class are non-stable by default so we need to make them transient

	func isRegistered(caller : Principal) : Bool {
		Buffer.contains(usersRegistry, caller, Principal.equal);
	};

	func trapAnonymous(caller : Principal) : () {
		if (Principal.isAnonymous(caller)) {
			Debug.trap("Anonymous caller");
		};
	};

	func trapUnregistered(caller : Principal) : () {
		if (not isRegistered caller) {
			Debug.trap("Unregistered caller");
		};
	};

	func trapDuplicateRegister(caller : Principal) : () {
		if (isRegistered caller) { Debug.trap("Already Registered") };
	};
	func trapNonUploader(uploader : Principal, caller : Principal) {
		if (uploader != caller) { Debug.trap("Unauthorized uploader") };
	};

	func trapUnauthorized(caller : Principal, expected : Principal) {
		if (caller != expected) { Debug.trap("Unauthorized caller") };
	};

	func _validateFileSha256(expectedSha256 : ?Blob, actualSha256 : ?Blob) {
		switch (expectedSha256, actualSha256) {
			case (?expected, ?actual) {
				if (expected != actual) Debug.trap("sha256 mismatch");
			};
			case (?_expected, null) Debug.trap("File has no sha256");
			case (null, _) {};
		};
	};

	system func preupgrade() {
		persistedUserRegisrty := Buffer.toArray(usersRegistry);
		persistedFilesStored := Iter.toArray(filesStored.entries());
	};

	system func postupgrade() {
		// clear everything after updrage
		for (userP in persistedUserRegisrty.vals()) {
			usersRegistry.add(userP);
		};
		persistedUserRegisrty := [];

		for ((fileName, file) in persistedFilesStored.vals()) {
			filesStored.put(fileName, file);
		};

		persistedFilesStored := [];
	};

	// // Register to the file store bucket for uploading files
	// public shared ({ caller }) func registerUser(reg : ?Principal) : async () {
	//   trapAnonymous caller;
	//   trapDuplicateRegister caller;
	//   switch (reg) {
	//     case (?p) { trapAnonymous(p); usersRegistry.add(p) };
	//     case (null) { usersRegistry.add(caller) };
	//   };

	// };

	// Register user by backend to the file store bucket for uploading files
	public shared ({ caller }) func register_user_by_backend(user : Principal) : async () {
		trapUnauthorized(caller, backend); // check that the caller is the backend
		trapAnonymous(user); // check that the user is not anonymous
		usersRegistry.add(user);
	};

	public shared query ({ caller }) func is_user_registered() : async Bool {
		isRegistered(caller);
	};

	// public query func get_users_registry() : async [Principal] {
	//   Buffer.toArray(usersRegistry);
	// };

	public shared ({ caller }) func create_batch(args : BatchArg) : async BatchId {
		// trapAnonymous caller;
		trapUnregistered caller; // check if the caller is registered
		let batchId = nextBatchId;
		let subArg = { batchId; uploader = caller };
		let batch : Batch = Batch.Batch<system>({ args and subArg }, batches, filesStored);

		batches.put(batchId, batch);
		nextBatchId += 1;
		return batchId;
	};

	public shared ({ caller }) func upload_chunk({ batchId; chunk } : UploadChunkArg) : async () {
		// trapAnonymous caller;
		// trapUnregistered caller;

		let batch : Batch = switch (batches.get(batchId)) {
			case (?value) {
				trapNonUploader(value.uploader, caller); // check if the caller is the uploader of the batch
				value;
			};
			case (null) { Debug.trap("Batch not found") };
		};
		batch.addChunk<system>(chunk);
	};

	public shared query ({ caller }) func get_stored_files() : async [(Text, File)] {
		trapUnauthorized(caller, admin); // check if the caller is the admin
		Iter.toArray(filesStored.entries());
	};

	public shared query ({ caller }) func get({ file_name : FileName }) : async {
		modified : Nat64;
		content_type : Text;
		content : Blob;
		sha256 : ?Blob;
		chunks_left : Nat;
	} {
		// trapAnonymous caller;
		// trapUnregistered caller;
		trapUnauthorized(caller, admin); // check if the caller is the admin

		switch (filesStored.get(file_name)) {
			case (?{ modified; contentType; content; sha256 } : ?File) {
				{
					modified;
					content_type = contentType;
					content = content[0];
					sha256;
					chunks_left = content.size() -1;
				};
			};
			case (null) { Debug.trap("File not Found") };
		};
	};

	public shared query ({ caller }) func get_chunk({
		file_name : FileName;
		index : Nat;
		// sha256 : ?Blob;
	}) : async { content : Blob } {
		// trapAnonymous caller;
		// trapUnregistered caller;
		trapUnauthorized(caller, admin); // check if the caller is the admin

		switch (filesStored.get(file_name)) {
			case (?file) {
				// validateFileSha256(sha256, file.sha256);
				{
					content = file.content[index];
				};
			};
			case (null) { Debug.trap("File not Found") };
		};

	};

	public shared query ({ caller }) func list() : async [FileInfo] {
		// trapAnonymous caller;
		// trapUnregistered caller;
		trapUnauthorized(caller, admin); // check if the caller is the admin

		let buffer = Buffer.Buffer<FileInfo>(filesStored.size());

		for ((file_name, { modified; contentType; content; sha256 }) in filesStored.entries()) {
			let content_type = contentType;
			let nos_chunks = content.size();
			var size = 0;
			for (chunk in content.vals()) {
				size += chunk.size();
			};

			buffer.add({ file_name; modified; content_type; sha256; size; nos_chunks });
		};
		Buffer.toArray(buffer);
	};

};
