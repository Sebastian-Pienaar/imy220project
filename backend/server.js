const express = require('express');
const cors = require('cors');

const app = express();
const port = 8000; //3000 vir react


//cors vir frontend om request te maak
app.use(cors());

app.use(express.json());

app.post('/api/login', (req, res) => {
  console.log('Login attempt received:', req.body);

  
  res.json({
    success: true,
    message: 'Login successful!',
    user: {
      id: '12345',
      name: 'Seb Pienaar',
      email: req.body.email,
    },
  
    //token om logged in user te stoor
    token: 'dummy-jwt-token-for-deliverable-1', 
  });
});

//Stubbed sign up endpoint
app.post('/api/signup', (req, res) => {
    console.log('Signup attempt received:', req.body);

    res.json({
        success: true,
        message: 'User created successfully!',
        user: {
            id: '67890',
            name: req.body.fullName,
            email: req.body.email,
        },
        token: 'another-dummy-jwt-token-for-new-user',
    });
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});