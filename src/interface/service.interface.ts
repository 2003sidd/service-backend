export interface IService {
    name: string;
    description: string;
    services: {
        name: string;
        price: number;
    }[];
    isActive: boolean

}
