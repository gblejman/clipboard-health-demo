/* eslint-disable @typescript-eslint/no-var-requires */
const autocannon = require('autocannon');

const run = async () => {
  console.log('Starting... Ensure the api server is running!!!');

  const inmemory = await autocannon({
    url: 'http://localhost:3000/api/shifts?workerId=101&strategy=memory',
    connections: 2,
  });
  console.log(inmemory);

  const raw = await autocannon({
    // url: `http://localhost:3000/api/shifts?workerId=${data.worker1.id}&strategy=raw`,
    url: `http://localhost:3000/api/shifts?workerId=101&strategy=raw`,
    connections: 2,
  });

  console.log(raw);
  console.log('Finished.');
};

run();
