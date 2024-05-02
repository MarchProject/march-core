interface ApiResponse<T> {
  data: T
  status: {
    code: number
    message: string
  }
}

export const statusCode = {
  success: <T>(data: T, meesage: string = 'success'): ApiResponse<T> => {
    return { data, status: { code: 1000, message: meesage } }
  },
  forbidden: (message?: string) => {
    return {
      //wrong user
      data: null,
      status: {
        code: 9001,
        message: `Forbidden: ${message}`
      }
    }
  },
  duplicated: (message: string) => {
    return {
      data: null,
      status: {
        code: 9002,
        message
      }
    }
  },
  badRequest: (message?: string) => {
    return {
      data: null,
      status: {
        code: 9003,
        message: `Bad Request: ${message}`
      }
    }
  },
  onUse: (message: string) => {
    //badhavetype on use
    return {
      data: null,
      status: {
        code: 9004,
        message: message
      }
    }
  },
  internalError: (message: string) => {
    return {
      data: null,
      status: {
        code: 9999,
        message: `Internal Error: ${message}`
      }
    }
  }
}

//1000 success
//9001
