import os
import uuid
import urllib
import requests
import hmac
import hashlib
from django.db import transaction
from abc import abstractmethod, ABC
from datetime import datetime

from django.utils import timezone

from dineres.models import Transaction, Order


class PaymentStrategy(ABC):
    @abstractmethod
    def create_payment(self, amount, ref):
        pass

    @abstractmethod
    def verify_payment(self, data):
        pass

    @abstractmethod
    def get_payment_method(self):
        pass

    @abstractmethod
    def get_payment_status(self, data):
        pass

    def process_payment(self, data):
        if self.verify_payment(data):
            ref, status = self.get_payment_status(data)
            self.update_db(ref, status)

    def update_db(self, ref, status):
        with transaction.atomic():
            tran = Transaction.objects.select_related('order').get(transaction_ref=ref)
            tran.status = status
            if status == Transaction.Status.SUCCESS:
                tran.paid_at = timezone.now()

                order = tran.order
                if order.status != Order.Status.PAID:
                    Order.objects.filter(pk=order.pk).update(status=Order.Status.PAID)
            tran.save()


class CashPaymentStrategy(PaymentStrategy):
    def create_payment(self, amount, ref):
        return {
            "payUrl": f"{os.getenv('SERVER_URL')}/api/ipn/cash?ref={ref}",
        }

    def verify_payment(self, data):
        return True

    def get_payment_method(self):
        return Transaction.Method.CASH

    def get_payment_status(self, data):
        return data.get('ref'), Transaction.Status.SUCCESS


class MomoPaymentStrategy(PaymentStrategy):
    def __init__(self):
        self.accessKey = os.getenv("MOMO_ACCESS_KEY")
        self.secretKey = os.getenv("MOMO_SECRET_KEY")
        self.endpoint = "https://test-payment.momo.vn/v2/gateway/api/create"
        self.ipnUrl = f"{os.getenv('SERVER_URL')}/api/ipn/momo"
        self.redirectUrl = f"{os.getenv('SERVER_URL')}/api/ipn/momo"

    def create_payment(self, amount, ref):
        partnerCode = "MOMO"
        orderId = str(ref)
        requestId = str(uuid.uuid4())
        extraData = str(ref)

        raw_signature = (f"accessKey={self.accessKey}&amount={amount}&extraData={extraData}"
                         f"&ipnUrl={self.ipnUrl}&orderId={orderId}&orderInfo=Thanh toan Momo"
                         f"&partnerCode={partnerCode}&redirectUrl={self.redirectUrl}"
                         f"&requestId={requestId}&requestType=payWithMethod")

        h = hmac.new(bytes(self.secretKey, 'ascii'), bytes(raw_signature, 'utf-8'), hashlib.sha256)
        signature = h.hexdigest()

        data = {
            'partnerCode': partnerCode,
            'partnerName': "Test",
            'storeId': "MomoTestStore",
            'requestId': requestId,
            'amount': str(amount),
            'orderId': orderId,
            'orderInfo': "Thanh toan Momo",
            'redirectUrl': self.redirectUrl,
            'ipnUrl': self.ipnUrl,
            'lang': "vi",
            'extraData': extraData,
            'requestType': "payWithMethod",
            'signature': signature,
            'autoCapture': True
        }

        try:
            response = requests.post(self.endpoint, json=data)
            if response.status_code == 200:
                return response.json()
            else:
                return {'payUrl': None, 'err_msg': response.text}
        except Exception as e:
            return {'payUrl': None, 'err_msg': str(e)}

    def verify_payment(self, data):
        keys = [
            "accessKey", "amount", "extraData", "message", "orderId",
            "orderInfo", "orderType", "partnerCode", "payType", "requestId",
            "responseTime", "resultCode", "transId"
        ]

        raw_parts = []
        for k in keys:
            if k == "accessKey":
                raw_parts.append(f"{k}={self.accessKey}")
            else:
                value = data.get(k)
                if value is None:
                    value = ""
                raw_parts.append(f"{k}={str(value)}")

        raw_signature = "&".join(raw_parts)

        h = hmac.new(bytes(self.secretKey, 'ascii'), bytes(raw_signature, 'utf-8'), hashlib.sha256)
        my_signature = h.hexdigest()

        return hmac.compare_digest(my_signature, data.get('signature', ''))

    def get_payment_status(self, data):
        status = str(data.get('resultCode'))
        ref = data.get('orderId')

        if status == '0':
            return ref, Transaction.Status.SUCCESS
        else:
            return ref, Transaction.Status.FAILED

    def get_payment_method(self):
        return Transaction.Method.MOMO


class ZaloPayPaymentStrategy(PaymentStrategy):
    def __init__(self):
        self.app_id = os.getenv("ZLP_MERCHANT_APP_ID")
        self.key1 = os.getenv("ZLP_MERCHANT_KEY1")
        self.key2 = os.getenv("ZLP_MERCHANT_KEY2")
        self.endpoint = os.getenv("ZLP_MERCHANT_ENDPOINT")
        self.gateway_endpoint = os.getenv("ZLP_MERCHANT_GATEWAY_ENDPOINT")
        self.redirect_url = f"{os.getenv("SERVER_URL")}/api/ipn/zlpay"

    def get_mac(self, data, key):
        mac = hmac.new(
            key.encode("utf-8"),
            data.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        return mac

    def create_payment(self, amount, ref):
        inputData = {
            "app_id": int(self.app_id),
            "app_user": "OkeOU",
            "app_trans_id": f"{datetime.now().strftime('%y%m%d')}_{str(ref).replace('-', '')}",
            "app_time": int(datetime.now().timestamp() * 1000),
            "expire_duration_seconds": 900,
            "description": f"Giao dịch thanh toán cho {ref}",
            "amount": int(amount),
            "bank_code": "",
            "embed_data": "{\"preferred_payment_method\": [\"zalopay_wallet\"], \"redirecturl\": \"" + self.redirect_url + "\"}",
            "item": '[]',
        }

        data = "|".join([
            str(inputData["app_id"]),
            inputData["app_trans_id"],
            inputData["app_user"],
            str(inputData["amount"]),
            str(inputData["app_time"]),
            inputData["embed_data"],
            inputData["item"],
        ])

        inputData["mac"] = self.get_mac(data, self.key1)
        Transaction.objects.filter(transaction_ref=ref).update(transaction_ref=inputData["app_trans_id"])

        try:
            response = requests.post(self.endpoint + "/create", json=inputData)
            if response.status_code == 200:
                payUrl = response.json().get("order_url")
                return {"payUrl": payUrl}
            else:
                return {'payUrl': None, 'err_msg': response.text}
        except Exception as e:
            return {'payUrl': None, 'err_msg': str(e)}

    def verify_payment(self, data):
        raw_data = "|".join([
            data["appid"],
            data["apptransid"],
            data["pmcid"],
            data["bankcode"],
            data["amount"],
            data["discountamount"],
            data["status"],
        ])

        mac = self.get_mac(raw_data, self.key2)
        return hmac.compare_digest(mac, data['checksum'])

    def get_payment_method(self):
        return Transaction.Method.ZLPAY

    def get_payment_status(self, data):
        ref = data['apptransid']

        if data['status'] == '1':
            return ref, Transaction.Status.SUCCESS
        else:
            return ref, Transaction.Status.FAILED

class PaymentStrategyFactory:
    @staticmethod
    def get_strategy(method_name):
        strategies = {
            "CASH": CashPaymentStrategy,
            "MOMO": MomoPaymentStrategy,
            "ZLPAY": ZaloPayPaymentStrategy,
        }

        strategy = strategies.get(method_name.upper())
        return strategy()
