import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onSwitchToSignUp }) => {
  const navigate = useNavigate();

 
  const handleSubmit = async (event) => {
    event.preventDefault();

    //Kry data van vorm
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      //1 maak api call na backend server
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });


      //2 kry dummy data van server
      const data = await response.json();
      console.log('Response from server:', data);

      //3 check of login=success
      if (data.success) {
        //(sal user tokens hier stoor in deliv 2)
        console.log('Storing token:', data.token);
        
        //4 gaan home toe
        navigate('/home');
      } else {
        //failed login
        alert(data.message);
      }
    } catch (error) {
      console.error('Konnie met server connect nie:', error);
      alert('Konnie met server connect nie');
    }
  };

  return (
    <div className="registration-form">
      <div className="form-content">
        <h2>Login here</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">email</label>
            {/* 
              2 HTML5 validations:
              1. required: kannie niks in he nie
              2. type="email": moet valid email format wees
            */}
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">password</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className="register-btn">login</button>
        </form>
    
      </div>
    </div>
  );
};

export default LoginForm;