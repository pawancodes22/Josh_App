import './index.css'

import {Component} from 'react'

import Cookies from 'js-cookie'

import Loader from 'react-loader-spinner'

import Header from '../Header'

import JobItem from '../JobItem'

import {BsSearch} from 'react-icons/bs'

const apiStatusConstants = {
  success: 'SUCCESS',
  pending: 'PENDING',
  failure: 'FAILURE',
}

const EmploymentOption = props => {
  const {item, changeCheckboxInput} = props
  const {label, employmentTypeId} = item
  const onChangeCheckboxInput = event => {
    changeCheckboxInput(event.target.checked, employmentTypeId)
  }
  return (
    <li className="job-filter-container">
      <input
        type="checkbox"
        id={employmentTypeId}
        onChange={onChangeCheckboxInput}
      />
      <label htmlFor={employmentTypeId}>{label}</label>
    </li>
  )
}

const SalaryOption = props => {
  const {item, changeRadioInput} = props
  const {label, salaryRangeId} = item
  const onChangeRadioInput = () => {
    changeRadioInput(salaryRangeId)
  }
  return (
    <li className="job-radio-container">
      <input
        type="radio"
        id={salaryRangeId}
        className="job-radio-margin"
        name="amount_range"
        onChange={onChangeRadioInput}
      />
      <label htmlFor={salaryRangeId}>{label}</label>
    </li>
  )
}

class SearchBar extends Component {
  state = {searchValue: ''}
  changeSearchInput = event => {
    this.setState({searchValue: event.target.value})
  }
  onClickSubmitSearchInput = () => {
    const {submitSearchInput} = this.props
    const {searchValue} = this.state
    submitSearchInput(searchValue)
  }
  render() {
    return (
      <div className="search-box-container">
        <input
          type="search"
          placeholder="Search"
          className="search-input-job"
          onChange={this.changeSearchInput}
        />
        <button
          type="button"
          data-testid="searchButton"
          className="job-search-button"
          onClick={this.onClickSubmitSearchInput}
        >
          <BsSearch className="search-icon" />
        </button>
      </div>
    )
  }
}

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

class Jobs extends Component {
  state = {
    profileApiStatus: apiStatusConstants.pending,
    profileDetails: [],
    jobApiStatus: apiStatusConstants.pending,
    jobDetails: [],
    employmentType: [],
    salaryRange: '',
    searchInput: '',
  }

  componentDidMount() {
    this.fetchProfile()
    this.fetchJobs()
  }

  submitSearchInput = value => {
    this.setState({searchInput: value}, this.fetchJobs)
  }

  changeRadioInput = value => {
    this.setState({salaryRange: value}, this.fetchJobs)
  }

  changeCheckboxInput = (checkValue, value) => {
    const {employmentType} = this.state
    console.log('checkboxInputCalled', checkValue, value, employmentType)
    if (checkValue) {
      this.setState(
        prev => ({employmentType: [...prev.employmentType, value]}),
        this.fetchJobs,
      )
    } else {
      this.setState(
        prev => ({
          employmentType: prev.employmentType.filter(item => item !== value),
        }),
        this.fetchJobs,
      )
    }
  }

  fetchProfile = async () => {
    this.setState({profileApiStatus: apiStatusConstants.pending})
    const profileApiUrl = 'https://apis.ccbp.in/profile'
    const jwtToken = Cookies.get('jwt_token')
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(profileApiUrl, options)
    if (response.ok) {
      const jsonResponse = await response.json()
      const item = jsonResponse.profile_details
      const updatedData = {
        name: item.name,
        profileImageUrl: item.profile_image_url,
        shortBio: item.short_bio,
      }
      this.setState({
        profileDetails: updatedData,
        profileApiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({profileApiUrl: apiStatusConstants.failure})
    }
  }

  renderProfile = () => {
    const {profileDetails, profileApiStatus} = this.state
    const {name, profileImageUrl, shortBio} = profileDetails
    switch (profileApiStatus) {
      case apiStatusConstants.success:
        return (
          <>
            <div className="profile-backg">
              <img
                src={profileImageUrl}
                alt="profile"
                className="job-profile-logo"
              />
              <h1 className="job-profile-heading">{name}</h1>
              <p className="job-profile-subheading">{shortBio}</p>
            </div>
          </>
        )
      case apiStatusConstants.pending:
        return <div className="profile-loader">{this.renderLoader()}</div>
      case apiStatusConstants.failure:
        return (
          <div className="profile-loader">
            <button
              type="button"
              className="profile-retry"
              onClick={this.retryFetchingProfile}
            >
              Retry
            </button>
          </div>
        )
      default:
        return null
    }
  }

  fetchJobs = async () => {
    this.setState({jobApiStatus: apiStatusConstants.pending})
    const {employmentType, searchInput, salaryRange} = this.state
    const employmentTypeString = employmentType.join(',')
    const jwtToken = Cookies.get('jwt_token')
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const jobUrl = `https://apis.ccbp.in/jobs?employment_type=${employmentTypeString}&minimum_package=${salaryRange}&search=${searchInput}`
    const response = await fetch(jobUrl, options)
    if (response.ok) {
      const jsonResponse = await response.json()
      const updatedResponse = jsonResponse.jobs.map(jobItems => ({
        companyLogoUrl: jobItems.company_logo_url,
        employmentType: jobItems.employment_type,
        id: jobItems.id,
        jobDescription: jobItems.job_description,
        location: jobItems.location,
        packagePerAnnum: jobItems.package_per_annum,
        rating: jobItems.rating,
        title: jobItems.title,
      }))
      this.setState({
        jobDetails: updatedResponse,
        jobApiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({jobApiStatus: apiStatusConstants.failure})
    }
  }

  renderFirstHalf = () => {
    return (
      <>
        {this.renderProfile()}
        <hr className="profile-hr" />
        <div>
          <h1 className="job-filter-heading">Type of Employment</h1>
          <ul className="remove-padding">
            {employmentTypesList.map(item => (
              <EmploymentOption
                key={item.employmentTypeId}
                item={item}
                changeCheckboxInput={this.changeCheckboxInput}
              />
            ))}
          </ul>
        </div>
        <hr className="profile-hr" />
        <div>
          <h1 className="job-filter-heading">Salary Range</h1>
          <ul className="remove-padding">
            {salaryRangesList.map(item => (
              <SalaryOption
                key={item.salaryRangeId}
                item={item}
                changeRadioInput={this.changeRadioInput}
              />
            ))}
          </ul>
        </div>
      </>
    )
  }

  renderLoader = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  retryFetchingJob = () => {
    this.fetchJobs()
  }

  retryFetchingProfile = () => {
    this.fetchProfile()
  }

  renderJobs = () => {
    const {jobDetails, jobApiStatus} = this.state
    switch (jobApiStatus) {
      case apiStatusConstants.success: {
        if (jobDetails.length !== 0) {
          return (
            <ul className="remove-padding">
              {jobDetails.map(item => (
                <JobItem key={item.id} item={item} />
              ))}
            </ul>
          )
        }
        return (
          <div className="jobs-loader">
            <img
              className="no-jobs"
              src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
              alt="no jobs"
            />
            <h1>No Jobs Found</h1>
            <p>We couldn't find any jobs. Try other filters.</p>
          </div>
        )
      }
      case apiStatusConstants.failure: {
        return (
          <div className="jobs-loader">
            <img
              src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
              alt="failure view"
            />
            <h1>Oops! Something Went Wrong</h1>
            <p>We cannot seem to find the page you are looking for</p>
            <button
              type="button"
              className="profile-retry"
              onClick={this.retryFetchingJob}
            >
              Retry
            </button>
          </div>
        )
      }
      case apiStatusConstants.pending: {
        return <div className="jobs-loader">{this.renderLoader()}</div>
      }
      default:
        return null
    }
  }

  render() {
    const {employmentType, salaryRange, searchInput} = this.state
    return (
      <div className="job-page-bg">
        <Header />
        <div className="job-main-bg">
          <div className="job-main-first-half">{this.renderFirstHalf()}</div>
          <div className="job-main-second-half">
            <SearchBar submitSearchInput={this.submitSearchInput} />
            {this.renderJobs()}
          </div>
        </div>
      </div>
    )
  }
}

export default Jobs
