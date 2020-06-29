import flask
from main import send_sms

app = flask.Flask('functions')
methods = ['GET', 'POST', 'PUT', 'DELETE']

@app.route('/send-sms', methods=methods)
def catch_all(path=''):
    flask.request.path = '/' + path
    return send_sms(flask.request)

if __name__ == '__main__':
    app.run()