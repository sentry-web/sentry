import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import axiosIntance from '../../utils/axiosinstance'
import Modal from 'react-modal'
import TravelStoryCard from '../../components/Cards/TravelStoryCard'
import AddEdditTravelStory from '../Home/AddEdditTravelStory'
import ViewTravelStory from '../Home/ViewTravelStory'
import EmtyCard from '../../components/Cards/EmtyCard'
import {MdAdd} from 'react-icons/md'
import EmtyImg from '../../assets/images/react.svg'
import FilterInfoTitle from '../../components/Cards/FilterInfoTitle'
import {getEmptyCardMessage,getEmptyCardImg} from '../../utils/helper'


import { ToastContainer,toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { DayPicker } from 'react-day-picker'
import moment from 'moment/moment'
const Home = () => {

  const navigate = useNavigate()

  const [userInfo,setUserInfo] = useState(null)
  const [allStories,setAllstories] = useState([])

  const [searchQuery,setSearchQuery] = useState('')
  const [filterType,setFilterType] = useState('')

  const [dateRange,setDateRange] = useState(null /*from:null,to:null*/)

  const [opennAddEditModel,setOpennAddEditModel] = useState({
    isShown: false,
    type:"add",
    data:null
  })

  const [openViewModel,setOpenViewModel] = useState({
    isShown:false,
    data:null,
  })

  //get user info
  const getUserInfo = async() => {
    try{
      const response = await axiosIntance.get("/get-user")
      if(response.data && response.data.user){
        //set user info if user exists
        setUserInfo(response.data.user)
       // console.log(response)
      }
    }
    catch(error){
      //console.log(error)
      if(error.response.status === 401){
        //clear storage if unauthorized
        localStorage.clear()
        navigate("/login")//redirect to login
      }

    }
  }

  //GET all travels stories
  const getAllTravelsStories = async() => {
    try{
      const response = await axiosIntance.get("/get-travel-stories")
      if(response.data && response.data.stories){
        //set user info if user exists
        setAllstories(response.data.stories)
       // console.log(response.data.stories)
        
      }

    }
    catch(error){
      console.log("an unexpected error ocurred. please try again.")
    }
  }

  //handle edit story click
  const handleEdit = (data) => {
    setOpennAddEditModel({isShown:true,type:"edit",data:data})
  }

  //handle travel story click
  const handleViewStory = (data) => {
    setOpenViewModel({isShown:true,data})
  }

  //handle update favourite
  const updateIsFavourite = async (storyData) => {
    const storyId = storyData._id
  try{
    const response = await axiosIntance.put(
      "/update-is-favourite/" + storyId,
      {
        isFavourite: !storyData.isFavourite,
      }
    );
    // console.log("response.data.stories1")
    // console.log(response.data)
    // console.log(response.data.stories)

      if(response.data && response.data.stories){
        toast.success('traves update successfully')
        // console.log("response.data.stories")
        if(filterType==='search' && searchQuery){
          onSearchStory(searchQuery)
        }
        else if (filterType ==='date'){
          filterStoryByDate(dateRange)
        }
        else{
        getAllTravelsStories();
      }
      }
    

  } catch(error){
    console.log("an unexpected error ocurred. please try again.")
  }


  }

  //delete story
  const deleteTravelStory = async (data) => {
    const storyId = data._id

    try 
    {
      const response = await axiosIntance.delete("/delete-travel-stories/"+storyId)
      console.log(response.data)
      if(response.data && !response.data.error)
      {
        toast.error("story deleted successfully")
        setOpenViewModel((prevState) => ({...prevState,isShown:false}))
        getAllTravelsStories()
      }
    }
    catch(error){
      console.log("An ocurred error during deleted, try again ",error)
    }
  }

  //search story
  const onSearchStory = async (query) => {
    try 
    {
      const response = await axiosIntance.get("/search",{
        params: {
          query
        }
      })
      //console.log(response.data)
      if(response.data && response.data.stories)
      {
        setFilterType("search")
        setAllstories(response.data.stories)
      }
    }
    catch(error){
      console.log("An ocurred error during deleted, try again ",error)
    }
  }

  const handleClearSearch = () => {
    setFilterType("")
    getAllTravelsStories()
  }

  const filterStoryByDate = async(day) => {
    try{
      const starTDate = day.from ? moment(day.from).valueOf() : null
      const endDate = day.to ? moment(day.to).valueOf() : null

      if(starTDate && endDate){
        const response = await axiosIntance.get("/travel-stories/filter",{
          params: {starTDate,endDate}
        })
      
      
        if(response.data && response.data.stories){
          setFilterType("date")
          setAllstories(response.data.stories)
        }

      }

    }
    catch(error){
      console.log("An ocurred error. try again2")
    }
  }
  
  const handleDayClick = (day) => {
    setDateRange(day)
    filterStoryByDate(day)
  }

  const resetFilter = () => {
    setDateRange({from:null,to:null})
    setFilterType("")
    getAllTravelsStories()
  }

  useEffect(() => {
    getAllTravelsStories()
    getUserInfo()

    return () => {}
  },[])
  return (
    <>
       <Navbar userInfo={userInfo}  
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onSearchNote={onSearchStory}
          handleClearSearch={handleClearSearch}
       /> 


     {/* {JSON.stringify(userInfo)} */}
     {/* {JSON.stringify(allStories)}  */}

      <div className='container mx-auto py-10'>

        <FilterInfoTitle
          filterType={filterType}
          filterDates = {dateRange}
          onClear = {() => {
            resetFilter()
          }}
        />

        <div className='flex gap-7'>
          <div className='flex-1'>
            {allStories.length > 0 ? (
              <div className='grid grid-cols-2 gap-4'>
                {allStories.map((item) => {
                  return (
                    <TravelStoryCard
                    key={item._id}
                    imgUrl={item.imageUrl}
                    title={item.title}
                    story={item.story}
                    date={item.visitedDate}
                    visitedLocation={item.visitedLocation}
                    isFavourite={item.isFavourite}
                    // onEdit={()=> handleEdit(item)}
                    onClick={()=> handleViewStory(item)}
                    onFavouriteClick = {() => updateIsFavourite(item)}

                    />
                  )
                })}
              </div>
            ) : (
              <EmtyCard 
                imgSrc={getEmptyCardImg(filterType)} 
                message = {getEmptyCardMessage(filterType)}
              />
            )}
             {/* {JSON.stringify(allStories)}  */}
          </div> 
          <div className='w-[350px]'>
            <div className='bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg'>
              <div className='p-3'>
                <DayPicker
                  captionLayout='dropdown-buttons'
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDayClick}
                  pagedNavigation
                />
              </div>

            </div>
          </div>

        </div>

      </div>

        {/* add & edit travel story model */}
      <Modal 
        isOpen={opennAddEditModel.isShown}
        onRequestClose={()=> {}}
        style={{
          overlay:{
            backgroundColor: 'rgba(0,0,0,0.2)',
            zIndex:999,
          }
        }}
        appElement={document.getElementById('root')}
        className="model-box"
      >
      <AddEdditTravelStory 
        type={opennAddEditModel.type}
        storyInfo={opennAddEditModel.data}
        onClose={() => {
          setOpennAddEditModel({isShown:false,type:"add",data:null})
        }}
        getAllTravelsStories={getAllTravelsStories}
      />
      </Modal>
        {/* add & edit travel story model */}
        <Modal 
        isOpen={openViewModel.isShown}
        onRequestClose={()=> {}}
        style={{
          overlay:{
            backgroundColor: 'rgba(0,0,0,0.2)',
            zIndex:999,
          }
        }}
        appElement={document.getElementById('root')}
        className="model-box"
      >
        <ViewTravelStory 
          storyInfo={openViewModel.data || null}
          onClose={() => {
            setOpenViewModel((prevState) => ({...prevState,isShown:false}))
          }}
          onEditClick={() => {
            setOpenViewModel((prevState) => ({...prevState,isShown:false}))
            handleEdit(openViewModel.data || null)
          }}
          onDeleteClick={() => {
            deleteTravelStory(openViewModel.data || null)
          }}
        />
      </Modal>

      <button className='w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10' 
      onClick={() => {
        setOpennAddEditModel({isShown:true,type:"add",data:null})
      }}>
        <MdAdd className='text-[32px] text-white'/>

      </button>

      <ToastContainer />
    </>
  )
}

export default Home
