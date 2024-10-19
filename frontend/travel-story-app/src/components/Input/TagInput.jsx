import React from 'react'
import { useState } from 'react'
import { MdAdd,MdClose } from 'react-icons/md'
import { GrMapLocation } from 'react-icons/gr'

const TagInput = ({tags,setTags}) => {

    const [inputValue,setInputValue] = useState("")

    const addNewTag = () => {
        if(inputValue.trim() !== ""){
            setTags([...tags,inputValue.trim()])
        setInputValue("")
        }
        
    }

    const handleInputChange = (e) => {
        setInputValue(e.target.value)
    }

    const handleKeyDown = (e) => {
        if(e.key === "Enter"){
            addNewTag()
        }
    }

    const handleRemoveTag = (tagRemove) => {
        setTags(tags.filter((tag) => tag !== tagRemove))
    }
  return (
    <div>
        {/* {JSON.stringify(tags)} */}

        {tags.length > 0 && (
            <div className='flex items-center gap-2 flex-wrap mt-2'>
                {tags.map((tag,index) => (
                    <span key={index} className='flex items-center gap-2 text-sm text-cyan-600 bg-cyan-200/40 px-3 py-1 rounded'>
                        <GrMapLocation className='text-sm' /> {tag} 
                        <button onClick={() => handleRemoveTag(tag)}>
                            <MdClose />
                        </button>

                    </span>
                ))}

            </div>
        )}

        <div className='flex items-center gap-4 mt-3'>
            <input 
            type='text'
            value={inputValue}
            className='text-sm bg-transparent border px-3 py-2 round  outline-none'
            placeholder='add location'
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            />

            <button className='w-8 h-8 flex items-center justify-center rounded border border-cyan-500 hover:bg-cyan-500' onClick={addNewTag} >
                <MdAdd className='text-2xl text-cyan-500 hover:text-white' />
            </button>
        </div>
    </div>
  )
}

export default TagInput
