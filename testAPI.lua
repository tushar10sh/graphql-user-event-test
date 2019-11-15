wrk.method = "POST"
wrk.body   = '{ "query": "{ bookings { _id, user { _id, bookings { _id } }, event { _id,  bookedBy { _id } } } } " }'
wrk.headers["Content-Type"] = "application/json"
