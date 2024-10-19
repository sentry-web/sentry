import React from 'react'
import ProfileInfo from '../components/Cards/ProfileInfo'
import SearchBar from '../components/Input/SearchBar'

import LOGO from '../assets/images/react.svg'
import { useNavigate } from 'react-router-dom'

const Navbar = ({userInfo,searchQuery,setSearchQuery,onSearchNote,handleClearSearch}) => {

    const isToken = localStorage.getItem("token")
    const navigate = useNavigate()
    const onlogout = () => {
        localStorage.clear()
    navigate("/login")
    }

    const handleSearch = () => {
      if(searchQuery) {
        onSearchNote(searchQuery)
      }
    }
    const onClearSearch = () => {
      handleClearSearch()
      setSearchQuery("")
    }
  return (
    <div className='bg-white flex items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10'>
      <img src={LOGO} alt='travel story' className='h-9' />

         
       {isToken && 
       <>
       
       <SearchBar 
          value = {searchQuery}
          onChange = {({target}) => {
            setSearchQuery(target.value)
          }}
          handleSearch={handleSearch}
          onClearSearch = {onClearSearch}
       />
       
       <ProfileInfo userInfo={userInfo} onlogout={onlogout}/> 
       </>
       }
    </div>
  )
}

export default Navbar
