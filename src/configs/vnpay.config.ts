import {
	HashAlgorithm,
	ProductCode,
	VNPay,
	VnpCurrCode,
	VnpLocale,
	ignoreLogger,
} from 'vnpay';

export const vnpay = new VNPay({
	tmnCode: 'NY1CCVSA',
	secureSecret: '3L9RDGZN55ZEQLNY70JWW0IR8W2BGBIR',
	vnpayHost: String(process.env.VNPAYHOST),
	testMode: true,
	hashAlgorithm: HashAlgorithm.SHA512,
	vnp_Version: '2.1.0',
	vnp_CurrCode: VnpCurrCode.VND,
	vnp_Locale: VnpLocale.VN,
	vnp_OrderType: ProductCode.Pay,
	enableLog: true,
	loggerFn: ignoreLogger,

	endpoints: {
		paymentEndpoint: 'paymentv2/vpcpay.html',
		queryDrRefundEndpoint: 'merchant_webapi/api/transaction',
		getBankListEndpoint: 'qrpayauth/api/merchant/get_bank_list',
	},
});

export const vnpayConfig = {
	vnp_IpAddr: '127.0.0.1',
	vnp_ReturnUrl: 'http://172.29.80.1:3000',
};
