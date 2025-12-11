import React from 'react'
import { Link } from 'react-router-dom'
function FilterNav() {
    return (
        <div className='  md:hidden flex  gap-7 mx-5'>
            <Link to='/product/all' className=' hover:underline uppercase '>All</Link>|
            <Link to='/product/ladies' className=' hover:underline uppercase '>Ladies</Link>|
            <Link to='/product/man' className=' hover:underline uppercase '>Man</Link>|
            <Link to='/product/kids' className=' hover:underline uppercase '>Kids</Link>
        </div>
    )
}

export default FilterNav
