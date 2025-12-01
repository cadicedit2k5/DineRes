from django.http import HttpResponse

def index(request):
    return HttpResponse("Dine Res Application")