declare module 'qrcode' {
	export function toDataURL(data: any, options?: any): Promise<string>;
	const QRCode: {
		toDataURL: typeof toDataURL;
	};
	export default QRCode;
}

export {};
