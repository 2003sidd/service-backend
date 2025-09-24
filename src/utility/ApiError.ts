class ApiError<T> extends Error {
    statusCode:number;
    data:T;
    message: string;
    constructor(
        statusCode:number,
        message:string= "Something went wrong",
        data:T,
    ){
        super()
        this.statusCode = statusCode
        this.data = data
        this.message = message
    }
}

export default ApiError;