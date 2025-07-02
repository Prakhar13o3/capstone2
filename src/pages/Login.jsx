import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from "./../components/firebase";

export const Login = () => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Login Successful");

      
      const redirectTo = location.state?.from || "/Home";
      navigate(redirectTo);

    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className='signup-container'>
      <form className='signup-form' onSubmit={handleSubmit}>
        <h2>Login</h2>
        <label htmlFor='email'>
          Email:
          <input type="text" onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label htmlFor='password'>
          Password:
          <input type="password" onChange={(e) => setPassword(e.target.value)} />
        </label>

        <button>Login</button>
        <p>Don't Have an Account? <Link className="nav-link" to="/Signup">Signup</Link></p>
      </form>
    </div>
  )
}

export default Login;
