# pixiv_service
Fetches the URL for new posts with the specified tag. Currently only works for single tag searches.

## auth.json
Add your username and password

### example auth.json
```json
{
  "username": "<your_username_here>",
  "password": "<your_password_here>"
}
```


## config.json
- checkLatency: change how frequently the service checks for new posts. Default of 20 minutes seems to work well.
  - example: ``"checkLatency": "20"``
- tags: ensure tags are enclosed in double quotes and within the array, e.g. "<your_tag_here>".
  - example: ``"tags": ["<your_tag_here", "<new_tag>", "<other_more_new_tag>"]``
  
### example config.json
```json
{
  "checkLatency": "20",
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}
```
