import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import { throwing } from 'rescape-ramda';
const {reqPath} = throwing

class Header extends Component {

  render(props) {
    const {userIdKey, userAuthTokenKey} = reqPath(['settings', 'graphcool'], props)
    const userId = localStorage.getItem(userIdKey)
    return (
      <div className='flex pa1 justify-between nowrap orange'>
        <div className='flex flex-fixed black'>
          <div className='fw7 mr1'>Hacker News</div>
          <Link to='/' className='ml1 no-underline black'>new</Link>
          <div className='ml1'>|</div>
          <Link to='/top' className='ml1 no-underline black'>top</Link>
          <div className='ml1'>|</div>
          <Link to='/search' className='ml1 no-underline black'>search</Link>
          {userId &&
          <div className='flex'>
            <div className='ml1'>|</div>
            <Link to='/create' className='ml1 no-underline black'>submit</Link>
          </div>
          }
        </div>
        <div className='flex flex-fixed'>
          {userId ?
            <div className='ml1 pointer black' onClick={() => {
              localStorage.removeItem(userIdKey)
              localStorage.removeItem(userAuthTokenKey)
              this.props.history.push(`/new/1`)
            }}>logout</div>
            :
            <Link to='/login' className='ml1 no-underline black'>login</Link>
          }
        </div>
      </div>
    )
  }

}

export default withRouter(Header)