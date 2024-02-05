interface ApiResponse<T> {
  data: T
  status: {
    code: number
    message: string
  }
}

export const statusCode = {
  success: <T>(data: T): ApiResponse<T> => {
    return { data, status: { code: 1000, message: 'success' } }
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
  duplicated: {
    data: null,
    status: {
      code: 9002,
      message: 'Duplicated Name'
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
  onUse: {
    //badhavetype on use
    data: null,
    status: {
      code: 9004,
      message: 'On Use'
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
