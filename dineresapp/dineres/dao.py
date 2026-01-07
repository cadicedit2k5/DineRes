from datetime import timedelta
from django.utils import timezone

from django.db.models import Sum, F, Count
from django.db.models.functions import TruncMonth, TruncDate, TruncWeek

from dineres.models import OrderDetail, Dish, Booking


# thống kê số lượng và doanh thu từng món theo ngày, tháng, năm
def get_dishes_quantity_stats(period='month'):
    now = timezone.now()

    qs = OrderDetail.objects.filter(
        order__status__in=['paid', 'done']
    )

    if period == 'day':
        qs = qs.filter(order__created_date__date=now.date())

    elif period == 'week':
        start_week = (now - timedelta(days=now.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        end_week = start_week + timedelta(days=7)

        qs = qs.filter(
            order__created_date__gte=start_week,
            order__created_date__lt=end_week
        )

    else:
        qs = qs.filter(
            order__created_date__year=now.year,
            order__created_date__month=now.month
        )

    return (
        qs.values('dish__id', 'dish__name')
            .annotate(total_quantity=Sum('quantity'))
            .annotate(total_amount=Sum(F('quantity') * F('price_at_order')))
            .order_by('-total_amount')
    )

# thống kê tổng doanh thu trong ngày, tháng, năm
def get_dishes_amount_stats(period='month'):
    now = timezone.now()

    qs = OrderDetail.objects.filter(
        order__status__in=['paid', 'done']
    )

    if period == 'day':
        qs = qs.filter(order__created_date__date=now.date())

    elif period == 'week':
        start_week = (now - timedelta(days=now.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        end_week = start_week + timedelta(days=7)

        qs = qs.filter(
            order__created_date__gte=start_week,
            order__created_date__lt=end_week
        )

    else:
        qs = qs.filter(
            order__created_date__year=now.year,
            order__created_date__month=now.month
        )

    return (
        qs.aggregate(total_amount=Sum(F('quantity') * F('price_at_order')))
    )

# thống kê theo ngày, tuần, tháng bán được bao nhiêu món
def get_dishes_quantity_timeline(period='month'):
    now = timezone.now()

    qs = OrderDetail.objects.filter(
        order__status__in=['paid', 'done']
    )

    if period == 'day':
        qs = qs.filter(order__created_date__date=now.date())
        trunc = TruncDate

    elif period == 'week':
        start_week = (now - timedelta(days=now.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        end_week = start_week + timedelta(days=7)

        qs = qs.filter(
            order__created_date__gte=start_week,
            order__created_date__lt=end_week
        )
        trunc = TruncWeek

    else:
        qs = qs.filter(
            order__created_date__year=now.year,
            order__created_date__month=now.month
        )
        trunc = TruncMonth

    return (
        qs.annotate(time=trunc('order__created_date'))
            .values('time')
            .annotate(total_quantity=Sum('quantity'))
            .order_by('time').first()
    )

def get_dishes_quantity():
    return (Dish.objects.count())

# thông kê tần suất đặt bàn cho ngày, tháng, năm
def get_total_booking_count(period='month'):
    now = timezone.now()

    qs = Booking.objects.filter(
        status__in=[
            Booking.Status.CONFIRMED,
            Booking.Status.COMPLETED
        ]
    )

    if period == 'day':
        qs = qs.filter(booking_time__date=now.date())

    elif period == 'week':
        start_week = (now - timedelta(days=now.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        end_week = start_week + timedelta(days=7)
        qs = qs.filter(booking_time__range=(start_week, end_week))

    else:
        qs = qs.filter(
            booking_time__year=now.year,
            booking_time__month=now.month
        )

    return qs.count()

#thống kế đặt bàn ngày trong tuần, tuần trong tháng, tháng trong năm
def get_total_booking_timeline(period='month'):
    now = timezone.now()

    qs = Booking.objects.filter(
        status__in=[
            Booking.Status.CONFIRMED,
            Booking.Status.COMPLETED
        ]
    )

    if period == 'day':
        trunc = TruncDate

        start = (now - timedelta(days=now.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        end = start + timedelta(days=7)
        qs = qs.filter(booking_time__range=(start, end))

    elif period == 'week':
        trunc = TruncWeek

        qs = qs.filter(
            booking_time__year=now.year,
            booking_time__month=now.month
        )

    else:
        trunc = TruncMonth

        qs = qs.filter(
            booking_time__year=now.year
        )

    return (
        qs.annotate(time=trunc('booking_time'))
          .values('time')
          .annotate(total_bookings=Count('id'))
          .order_by('time')
    )
