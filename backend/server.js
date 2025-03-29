const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

app.get('/', (req, res) => {
  res.json({ message: 'Agora Token Server is running' });
});

app.post('/generate-token', (req, res) => {
  const { channelName, uid = 0, role = 'publisher', expirationTimeInSeconds = 3600 } = req.body;
  console.log('Token generation requested for channel:', channelName);
  
  if (!channelName) {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  try {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    const roleValue = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      roleValue,
      privilegeExpiredTs
    );

    return res.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Agora Token Server running on port ${PORT}`);
});