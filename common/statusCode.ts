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
  forbidden: {
    //wrong user
    data: null,
    status: {
      code: 9001,
      message: 'FORBIDDEN'
    }
  },
  duplicated: {
    data: null,
    status: {
      code: 9002,
      message: 'Duplicated Name'
    }
  },
  badRequest: {
    data: null,
    status: {
      code: 9003,
      message: 'Bad Request'
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
  internalError: {
    data: null,
    status: {
      code: 9999,
      message: 'Internal Error'
    }
  }
}

//1000 success
//9001
