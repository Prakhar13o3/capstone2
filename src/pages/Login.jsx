import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {auth} from "./../components/firebase"
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export const Login = () => {

  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const navigate=useNavigate()

  const handleSubmit = async (e)=>{
    e.preventDefault()
    try{
      await signInWithEmailAndPassword(auth,email,password)
      console.log("Login Successfull")
      navigate("/Home")
    }
    catch(err)
    {
      console.log(err)
    }
  }
  return (
    <div className='signup-container'>

        <form className='signup-form' onSubmit={handleSubmit}>

            <h2>Login</h2>
            <label htmlFor='email'>
                Email:
                <input type="text" onChange={(e)=>setEmail(e.target.value)}/>
            </label>
            
            <label htmlFor='password'>
                Password:
                <input type="password" onChange={(e)=>setPassword(e.target.value)}/>
            </label>

            <button>Login</button>
            <p>Dont Have Account ? <Link className="nav-link" to="/Signup">Signup</Link></p>

        </form>

    </div>
  )
}

export default Login
