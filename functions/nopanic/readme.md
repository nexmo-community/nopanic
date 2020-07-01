### For testing locally with tester. Just enter to the nopanic directory and execute

```javascript
NEXMO_API_KEY='' NEXMO_API_SECRET='' NEXMO_NUMBER='' python tester.py
```

**Note:** Assign the values for the environment vars

### Notes for gcloud deployment

Testing:

```javascript
gcloud functions describe send_sms --set-env-vars NEXMO_API_KEY='',NEXMO_API_SECRET='',NEXMO_NUMBER=''
```

Production:

```javascript
gcloud functions deploy send_sms --set-env-vars NEXMO_API_KEY='',NEXMO_API_SECRET='',NEXMO_NUMBER='' --runtime python37 --trigger-http --project [PROJECT_ID]
```

Dont forget to configure the cloud function permissions to assign the `cloud function invocator` role and the `allUsers` as member. The cloud function is going to verify the token.