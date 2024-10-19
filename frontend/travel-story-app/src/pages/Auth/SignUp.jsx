import React, { useState } from 'react'
import PasswordInput from '../../components/Input/PasswordInput.jsx'
import { useNavigate } from 'react-router-dom';
import {validateEmail} from '../../utils/helper.js'
import axiosIntance from '../../utils/axiosinstance.js'

 const SignUp = ()  => {

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState(null);
  

  const navigate = useNavigate()

  const handleSignUp = async (e) => {
    e.preventDefault()

    if(!name){
      setError("please enter your name.")
      return
    }

    if(!validateEmail(email)){
      setError("please enter a valid email addres.")
      return
    }

    if(!password) {
      setError("Please enter the password")
      return
    }
    setError("")

    //SignUp API Call
    try{
      const response = await axiosIntance.post("/create-account", {
        fullname:name,
        email: email,
        password:password,
      })

      console.log(response)
      //handle successfully login response
      if(response.data && response.data.acccesToken){
        localStorage.setItem("token", response.data.acccesToken)
        navigate("/dashboard")
      }
    }
    catch(error){
      //handle login error
      if(
      error.response &&
      error.response.data &&
      error.response.data.message
    ){
      setError(error.response.data.message)
    }
    else{
      setError("An unexpected error ocurred. Please try again.")
    }
    }
    
  }

  return (
    <div className='h-screen bg-cyan-50 overflow-hidden relative'>

      <div className='login-ui-box right-10 -top-40' />
      <div className='login-ui-box bg-cyan-200 -bottom-40 right-1/2' />

      <div className='container h-screen flex items-center justify-center px-20 mx-auto'>
        <div className='w-2/4 h-[90vh] flex items-end bg-signup-bg-img bg-cover bg-center rounded-lg p-10 z-50'>
          <div>
            <h4 className='text-5xl text-white font-semibold leading-[58px]'>
             Join the <br/>Aventure
            </h4>
            <p className='text-[15px] text-white leading-6 pr-7 mt-4'> 
              Create an account to start documenting your travels and preserving
              your memories in your personal travel journal.
            </p>
          </div> 
        </div>

        <div className='w-2/4 h[75vh] bg-white rounded-r-lg relative p-16 shadow-lg shadow-cyan-200/20'>
          <form onSubmit={handleSignUp}>
            <h4 className='text-2xl font-semibold mb-7'>SignUp</h4>

            <input type='text' placeholder='Full name' className='input-box'
            value={name}
            onChange={({target}) => {
              setName(target.value);
            }}
            />

            <input type='text' placeholder='Email' className='input-box'
            value={email}
            onChange={({target}) => {
              setEmail(target.value);
            }}
            />
             

            <PasswordInput 
            value={password}
            onChange={({target}) => {
              setPassword(target.value);
            }}/>

            {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}

            <button type='submit' className='btn-primary'>
            CREATE ACOUNT 
            </button>
            <p className='text-xs text-slate-500 text-center my-4'>Or</p>
            <button 
            type='submit'
            className='btn-primary btn-light'
            onClick={() => {
              navigate("/login")
            }}
            >
              Login
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}

export default SignUp