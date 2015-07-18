# hostkeeper REST interface

At the moment the API provides the following routes:

## Routes

### Get all hosts

#### Route

> `GET /api/show`

#### `curl` example

```shell
$ curl -i -X GET -H "Content-Type:application/json" http://[hostkeeper]/api/show

HTTP/1.1 200 OK
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 06 Jul 2015 22:57:54 GMT
Connection: keep-alive
Transfer-Encoding: chunked
```

#### Response

```json
{
    "success": true,
    "method": "show",
    "payload": [
        {
            "id": 1,
            "host": "this.is.a.tld.test",
            "ip": "1.2.3.4"
        },
        {
            "id": 2,
            "host": "another.tld.test",
            "ip": "2.3.4.5"
        }
    ]
}
```

### Show specific host

#### Route

> `GET /api/show/:host`

`:host` is the host id

#### `curl` example

```shell
$ curl -i -X GET -H "Content-Type:application/json" http://[hostkeeper]/api/show/2

HTTP/1.1 200 OK
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 12 Jul 2015 15:44:54 GMT
Connection: keep-alive
Transfer-Encoding: chunked
```

#### Response

```json
{
    "success": true,
    "method": "show/2",
    "payload": {
        "id": 2,
        "host": "another.tld.test",
        "ip": "2.3.4.5"
    }
}
```

### Create new host

#### Route

> `POST /api/add`

#### Request

```json
{
    "host": "test.de",
    "ip": "8.9.10.11"
}
```

#### `curl` example

```shell
$ curl -i -X POST -H "Content-Type:application/json" http://[hostkeeper]/api/add \
-d '{"host":"test.de","ip":"8.9.10.11"}'

HTTP/1.1 201 Created
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 06 Jul 2015 22:58:33 GMT
Connection: keep-alive
Transfer-Encoding: chunked
```

#### Response

```json
{
    "success": true,
    "method": "add",
    "payload": {
        "id": 3,
        "host": "test.de",
        "ip": "8.9.10.11"
    }
}
```

### Delete specific host

#### Route

> `DELETE /api/delete/:host`

`:host` is the host id

#### `curl` example

```shell
$ curl -i -X DELETE -H "Content-Type:application/json" http://[hostkeeper]/api/delete/3

HTTP/1.1 200 OK
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 06 Jul 2015 22:59:57 GMT
Connection: keep-alive
Transfer-Encoding: chunked
```

#### Response

```json
{
    "success": true,
    "method": "delete/3",
    "payload": {
        "id": 3,
        "host": "test.de",
        "ip": "8.9.10.11"
    }
}
```

### Edit existing host

#### Route

> `PUT /api/edit/:host`

`:host` is the host id

#### Request

```json
{
    "host": "this.is.a.adjusted.tld",
    "ip": "3.4.5.6"
}
```

#### `curl` example

```shell
$ curl -i -X PUT -H "Content-Type:application/json" http://[hostkeeper]/api/edit/2 \
-d '{"host":"this.is.a.adjusted.tld","ip":"3.4.5.6"}'

HTTP/1.1 200 OK
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 06 Jul 2015 23:01:42 GMT
Connection: keep-alive
Transfer-Encoding: chunked
```

#### Response

```json
{
    "success": true,
    "method": "edit/2",
    "payload": {
        "id": 2,
        "host": "this.is.a.adjusted.tld",
        "ip": "34.45.56.67"
    }
}
```

### Reload dnsmasq's hosts file manually

#### Route

> `GET /api/update`

#### `curl` example

```shell
$ curl -i -X GET http://[hostkeeper]/api/update

HTTP/1.1 200 OK
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 06 Jul 2015 23:02:23 GMT
Connection: keep-alive
Transfer-Encoding: chunked
```

#### Response

```json
{
    "success": true,
    "method": "update"
}
```
