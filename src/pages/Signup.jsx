import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {auth} from "./../components/firebase"
import { useNavigate } from 'react-router-dom';



export const Signup = () => {

  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const navigate = useNavigate();

  const handleSubmit = async (e)=>{
    e.preventDefault()
    try{
      await createUserWithEmailAndPassword(auth,email,password)
      console.log("Account Created")
      navigate('/Login');
  
    }
    catch(err)
    {
      console.log(err)
    }
  }
  return (
    <div className='signup-container'>

        <form className='signup-form' onSubmit={handleSubmit}>

            <h2>Sign Up</h2>
            <label htmlFor='email'>
                Email:
                <input type="text" onChange={(e)=>setEmail(e.target.value)}/>
            </label>
            
            <label htmlFor='password'>
                Password:
                <input type="password" onChange={(e)=>setPassword(e.target.value)}/>
            </label>

            <button>Sign Up</button>
            <p>Already Registered? <Link className="nav-link" to="/Login">Login</Link></p>

        </form>

    </div>
  )
}
