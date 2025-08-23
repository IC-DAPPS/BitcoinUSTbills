import { toast } from "svelte-sonner";
import { uploadFile } from "./file-store.service";
import { authStore } from "$lib/auth";
import { get } from "svelte/store";
import { assertNonNullish } from "@dfinity/utils";
import { RequestKycReview } from "$lib/api";


let toastId: string | number;


/**
 * Handle KYC file upload and request review for User.
 * @param documentFrontFile - Passport Front Page
 * @param documentBackFile - Passport Back Page
 * @param selfieFile - Selfie with Passport
 */
export const handleKYCFileUpload = async (documentFrontFile: File, documentBackFile: File, selfieFile: File): Promise<void> => {



    try {

        const { identity } = get(authStore);
        assertNonNullish(identity, 'identity is Nullish value. please login');



        toastId = toast.loading('Submitting KYC documents...', {
            id: toastId
        });


        const frontFileName = `${identity.getPrincipal().toString()}/passport-front${getFileExtension(documentFrontFile.name)}`;


        const uploadFrontRespose = await uploadFile(documentFrontFile, frontFileName, getUploadProcessCallback("Passport Front Page"));

        if (!uploadFrontRespose.success) {
            toastId = toast.error('Failed to upload Passport Front Page', {
                id: toastId
            });
            return;
        }

        const backFileName = `${identity.getPrincipal().toString()}/passport-back${getFileExtension(documentBackFile.name)}`;

        const uploadBackRespose = await uploadFile(documentBackFile, backFileName, getUploadProcessCallback("Passport Back Page"));

        if (!uploadBackRespose.success) {
            toastId = toast.error('Failed to upload Passport Back Page', {
                id: toastId
            });
            return;
        }

        const selfieFileName = `${identity.getPrincipal().toString()}/selfie-with-passport${getFileExtension(selfieFile.name)}`;

        const uploadSelfieRespose = await uploadFile(selfieFile, selfieFileName, getUploadProcessCallback("Selfie with Passport"));

        if (!uploadSelfieRespose.success) {
            toastId = toast.error('Failed to upload Selfie with Passport', {
                id: toastId
            });
            return;
        }


        const uploadId = await RequestKycReview(frontFileName, backFileName, selfieFileName);


        toastId = toast.success(`KYC review requested. Please wait for review.`, {
            id: toastId
        });


    } catch (error) {
        console.error('Error submitting KYC:', error);
        toastId = toast.error('Failed to submit KYC documents. Please try again.', {
            id: toastId
        });
    }

}



const getUploadProcessCallback = (content: string) => {
    return (progress: number) => {
        if (progress === 100) {
            toast.success(`Uploaded ${content}`, {
                id: toastId,
            });
        } else {
            toast.loading(`Uploading ${content}... ${progress}%`, {
                id: toastId,
            });
        }
    }
};


function getFileExtension(fileName: string): string {
    if (!fileName || typeof fileName !== 'string') {
        throw new Error('File name must be a non-empty string');
    }

    const lastDotIndex = fileName.lastIndexOf('.');

    if (lastDotIndex === -1) {
        throw new Error(`File "${fileName}" has no extension`);
    }

    if (lastDotIndex === 0) {
        throw new Error(`File "${fileName}" appears to be a hidden file with no extension`);
    }

    if (lastDotIndex === fileName.length - 1) {
        throw new Error(`File "${fileName}" ends with a dot but has no extension`);
    }

    return fileName.substring(lastDotIndex).toLowerCase();
}