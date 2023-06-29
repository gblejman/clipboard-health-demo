# Caveats

I modified seed.ts so:

- It generates 200k records instead of 2 million, pg in docker was failing with `code: SqlState(E53100), message: could not resize shared memory segment`
- It distributes shifts through 5 years time span, better for UI display and it was generating shifts in the past fixed to a specific month

I modified docker-compose.yml so

- It doesn't run seed.ts everytime the container is (re)-created thus duplicating records. It now resets and seeds

- Had to run `prisma generate` from /seed to generate prism client types - might want to include it in the README

# Shift Service

Finds available shifts for a given workerId. Internally, there are 2 implementations/strategies

- Memory: fetches worker docs and facility requirements independently and diffs in-memory. Triggered by passing strategy: 'memory' (default)
- Raw: performs an sql raw query using join + intersect to diff docs. Triggered by passing strategy: 'raw'

# Testing

I believe the exercise can't be deterministically tested the way it is presented.
Even if there are in fact 3 deterministic workers having all documents, that does not imply there will be shifts available to them.
One could expect there would be shifts available due to the sheer amount of shifts generated, but not certain, thus it would be a flacky test.

Thus, I seed/teardown additional test data before each suite:

- Use case 1: Shift1 for Facility1 which requires no docs, Worker1 has no docs -> Shift1 should exist in results for Worker1
- Use case 2: Shift2 for Facility2 requires Doc1, worker has Doc1 -> Shift1 and Shift2 should exist in results for Worker2

- Run with: `npm test` - will run both service unit tests + server e2e tests. It doesn't require the api server to be running as it injects requests

# Api Server

Fastify server exposing the endpoint. TODO: Properly separate into modules/routes/controllers

- Run with `npm run api:dev` -> http://localhost:3000/api/shifts?workerId=101

# Web Server

A short demo to showcase finding shifts by worker id and displaying in calendar format

- cd into /web and run `npm run dev` -> http://localhost:5173/

# About Performance

## service

There's a simple explicit measurement when hitting the /api/shifts enpoint, it will determine the time spent around the invoked shift service and
add it as { meta: { ts: number }} in the response. Of course this is not scalable as performance is really a cross-cutting concern.

## e2e

Measures /api/shifts endpoint using both memory/raw implementation. It seems memory impl wins in latency/requests/throughput

- Ensure api server is running
- Run with `npm run benchmark`

## General Performance Improvements

- Add real observability via instrumentation, measure function calls, chokepoints. ie: OpenTelemetry
- Add caching at the application level. ie: Redis
- Optimize sql queries
- Use materialized views in db. Entities that have fields `is_deleted: true` or `is_active: false` would not even be considered for querying
- Use stored procedures in db
- Partition db using distinct fields that could help segmenting data. Ie: facility location
