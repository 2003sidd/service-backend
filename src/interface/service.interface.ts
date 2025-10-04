export interface IService {
    name: string;
    description: string;
    services: {
        _id:string
        name: string;
        price: number;
    }[];
    isActive: boolean

}
