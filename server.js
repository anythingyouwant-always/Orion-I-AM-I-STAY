const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { NodeVM } = require('vm2');

const app = express();
const port = 3000;

// ✅ Allow only your WordPress-based domain to access this server
app.use(cors({
  origin: 'https://obscureorbits-10ae709.ingress-earth.ewp.live',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-ally-key']
}));

const expectedKey = process.env.ALLY_KEY;

app.use(bodyParser.json());
app.use(express.static('public'));

// POST /run endpoint
app.post('/run', async (req, res) => {
  const providedKey = req.headers['x-ally-key'];

  if (providedKey !== expectedKey) {
    return res.status(403).json({ error: 'Unauthorized: invalid ALLY_KEY' });
  }

  const userCode = req.body.code;

  const vm = new NodeVM({
    console: 'redirect',
    sandbox: {},
    require: {
      external: true
    }
  });

  let output = '';
  vm.on('console.log', data => { output += data + '\n'; });

  try {
    await vm.run(userCode);
    res.json({ result: output });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ ProtectedAgent server is running on port ${port}`);
});
