<script lang="ts">
	import { DECIMALS, DIVISOR } from '$lib/constants';
	import { ckbtcBalance } from '$lib/state/ckbtc-balance.svelte';

	const fee = 10 / DIVISOR;

	import { decodeIcrcAccount, type IcrcAccount } from '@dfinity/ledger-icrc';
	import { transferToken } from '$lib/services/ledger.service';
	import { preventDefault } from '$lib/utils/event-handler.utils';
	import { formatNumber } from '$lib/utils/fromat.utils';

	import { ArrowUp, Send, SendHorizontal } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import Modal from '../ui/Modal.svelte';
	import Input from '../ui/Input.svelte';
	import Button from '../ui/Button.svelte';

	let open = $state(false);

	type Props = {
		ledgerId: string;
		iconSize?: number;
		children?: Snippet;
		class?: string;
	};

	let { ledgerId, iconSize, children, class: className }: Props = $props();

	let recipient = $state('');
	let amount = $state('');

	let recipientError = $state('');
	let amountError = $state('');

	let validAddressMessage = $state('');

	let isLoading = $state(false);

	let amountTouched = $state(false);
	let recipientTouched = $state(false);

	let disabled = $derived<boolean>(recipientError !== '' || amountError !== '' || isLoading);

	let to: IcrcAccount;

	const max = () => {
		if (ckbtcBalance.number > fee) {
			amount = (ckbtcBalance.number - fee).toString();
			validateAmount(amount);
		} else {
			amountError = 'Insufficient balance for transfer + fee';
		}
		amountTouched = true;
	};

	$inspect(validAddressMessage);
	// 47c3a3eb6a0efa93e4a9063e319468deb8d7ad5a6f040ee4643047f574d2638c
	function validateAmount(value: string) {
		if (!value) {
			amountError = 'Amount is required';
			return;
		}

		const numValue = parseFloat(value);
		if (isNaN(numValue) || numValue <= 0) {
			amountError = 'Amount must be greater than 0';
			return;
		}

		const maxAmount = ckbtcBalance.number - fee;

		if (numValue > maxAmount) {
			amountError = 'Insufficient balance for transfer + fee';
			return;
		}

		amountError = '';
	}

	$effect(() => {
		let value = amount.replace(/[^0-9.]/g, '');

		const parts = value.split('.');
		if (parts.length > 2) {
			value = `${parts[0]}.${parts[1]}`;
		}

		if (parts[1]?.length > DECIMALS) {
			value = `${parts[0]}.${parts[1].slice(0, DECIMALS)}`;
		}

		amount = value;
		validateAmount(value);
	});

	function validateICRC1Account(address: string): IcrcAccount | null {
		try {
			if (address.length < 8) return null; // Minimum length of principal id is 8 (aaaaa-aa)
			return decodeIcrcAccount(address);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	function isValidHex(str: string): boolean {
		const hexRegex = /^[0-9a-fA-F]+$/;
		return hexRegex.test(str);
	}

	$effect(() => {
		recipient = recipient.trim();

		// Perform validation once and store results
		const icrcAccount = validateICRC1Account(recipient);

		// Set validation message based on results
		if (icrcAccount) {
			recipientError = ''; // Valid address, clear error
			to = icrcAccount;
			if (icrcAccount.subaccount) {
				validAddressMessage = 'Valid ICRC-1 Account';
			} else {
				validAddressMessage = 'Valid Principal ID';
			}
		} else {
			validAddressMessage = '';

			// Set appropriate error message
			if (!recipient) {
				recipientError = 'Recipient is required';
			} else {
				recipientError = 'Invalid Address';
			}
		}
	});

	async function handleSubmit() {
		isLoading = true;
		await transferToken(Number(amount), to, ledgerId);
		isLoading = false;
	}
</script>

<Button variant="secondary" class="flex-1" on:click={() => (open = true)}>⬆ Withdraw</Button>

<Modal bind:open title="Withdraw ckBTC" size="lg">
	<form onsubmit={preventDefault(handleSubmit)} class="flex flex-col space-y-6" action="#">
		<div class="flex gap-3 p-2 rounded-lg border border-gray-300 bg-gray-100">
			<img src="/images/ckBTC-Token.svg" alt="ckBTC" class="w-12 h-12 rounded-full" />

			<div>
				<p class="text-base font-medium text-gray-900">ckBTC</p>

				<p class="text-sm text-gray-500">Balance: {ckbtcBalance.number ?? '0'} ckBTC</p>
			</div>
		</div>

		<label class="space-y-2" for="recipient">
			<span class="flex">Recipient Address </span>

			<Input
				type="text"
				id="recipient"
				bind:value={recipient}
				placeholder="Enter Recipient Address"
				color={recipientError && recipientTouched ? 'red' : 'base'}
				oninput={() => {
					recipientTouched = true;
				}}
			/>
			{#if recipientTouched}
				<p class="mt-2 text-red-700 dark:text-red-500 text-xs font-normal">
					{recipientError}
				</p>
			{/if}
			{#if validAddressMessage}
				<p class="mt-2 text-xs font-normal text-green-700 dark:text-green-500">
					{validAddressMessage}
				</p>
			{/if}
		</label>
		<label
			for="send-amount"
			class="space-y-2"
			color={amountError && amountTouched ? 'red' : 'gray'}
		>
			<div class="flex justify-between">
				<span>Amount</span>
				<Button
					type="button"
					class="px-4 py-0 rounded-lg"
					variant="secondary"
					size="sm"
					on:click={max}>Max</Button
				>
			</div>
			<Input
				type="text"
				id="send-amount"
				placeholder="Enter Amount"
				bind:value={amount}
				oninput={() => {
					amountTouched = true;
				}}
				color={amountError && amountTouched ? 'red' : 'base'}
			/>
			{#if amountTouched}
				<p class="mt-2 text-red-700 dark:text-red-500 text-xs font-normal">
					{amountError}
				</p>
			{/if}
		</label>
		<div class="flex justify-between text-sm">
			<p>Fee:</p>
			<p>{formatNumber(fee, ledgerId)} ckBTC</p>
		</div>
		<Button type="submit" class="w-full" {disabled}
			><ArrowUp /> <span class="ml-2">Withdraw</span></Button
		>
	</form>
</Modal>
