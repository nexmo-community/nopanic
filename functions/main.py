# This is a CLOUD FUNCTION - not a FIREBASE CLOUD FUNCTION
# At the moment Firebase cloud functions supports Nodejs as Language

# This python cloud function will send a sms message using the nexmo service 

# Import section: nexmo for sending sms messages, os to read environment vars
import nexmo, os

# from flask module we import the jsonify function to return valid json responses
from flask import jsonify, abort

# For logging
from datetime import datetime

# For verify token
import firebase_admin
from firebase_admin import auth
from functools import wraps

firebase_admin.initialize_app()

# Get environment vars - defined at the momento to deploy with gcloud command
NEXMO_API_KEY = os.environ.get('NEXMO_API_KEY')
NEXMO_API_SECRET = os.environ.get('NEXMO_API_SECRET')
NEXMO_NUMBER = os.environ.get('NEXMO_NUMBER')

# Init the client
client = nexmo.Client(
    key=NEXMO_API_KEY,
    secret=NEXMO_API_SECRET
)

# Verify the token
def firebase_auth_required(f):
    @wraps(f)
    def wrapper(request):
        if request.method == 'OPTIONS':
            return f(request)
            
        authorization = request.headers.get('Authorization')
        #print(authorization)
        id_token = None
        if authorization and authorization.startswith('Bearer '):
            id_token = authorization.split('Bearer ')[1]
            #print(id_token)
        else:
            print('Authorization header not found')
            response = jsonify(
                {
                    'error': {
                        'code': 401,
                        'message': "Not Authorized"
                    }
                }
            )
            response.status_code = 401
            abort(response)

        try:
            decoded_token = auth.verify_id_token(id_token)
        except Exception as e: # ValueError or auth.AuthError
            print('Invalid token')
            response = jsonify(
                {
                    'error': {
                        'code': 401,
                        'message': "Not Authorized"
                    }
                }
            )
            response.status_code = 401
            abort(response)

        return f(request, decoded_token)
    return wrapper

# The cloud function
@firebase_auth_required
def send_sms(request, decoded_token = None):

    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Authorization, Content-Type',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)
    
    # Verifying the data from json
    #data = request.get_json(silent=True)
    data = request.json.get('data')

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    # Exception handler
    try:
        # Validation block
        #if not request.method == 'POST':
        if not (data and 'phoneTo' in data):
            raise Exception('The phoneTo param is required but was not provided')
        elif not (data and 'message' in data):
            raise Exception('The message parameter is required but was not found')
        elif not (data['phoneTo'] and data['message']):
            raise Exception('phoneTo and message does not allow empty values')
        
        phone = data['phoneTo']
        message = data['message']

        # Date and time on isoformat - for logging
        current_datetime = datetime.today().isoformat()
        
        print(f'{current_datetime} - Sending SMS to {phone}')
        print('{current_datetime} - Message to send {message}'.format(current_datetime=current_datetime, message=message))

        response = client.send_message(
            {
                'from': NEXMO_NUMBER,
                'to': phone,
                'text': message,
                'type': 'unicode'
            }    
        )

        if response['messages'][0]['status'] == '0':
            print('Message sent successfully.')
            return jsonify(
                {
                    'data': {
                        'success': True,
                        'message': 'Message sent.'
                    }
                }
            ), 200, headers
        else:
            raise Exception(f'Message failed with error: {response["messages"][0]["error-text"]}')

    except Exception as e:
        return jsonify(
            {
                'data': {
                    'success': False,
                    'message': str(e)
                }
            }
        ), 200, headers
