import { Principal } from "@dfinity/principal";
import { v4 as uuidv4 } from 'uuid';

/**
 * A Construct for a Client Details of Type 'Record' 
 */
type Client = {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: bigint;
    requests: Request[];
    createdAt: bigint;
    updatedAt?: bigint;
};

/**
 * A Construct for a Service Details of Type 'Record' 
 */
type Service = {
    id: string;
    servicename: string;
    description: string;
    requestcount: number;
    createdAt: bigint;
    updatedAt?: bigint;
};

/**
 * A Construct for a Request Details of Type 'Record' 
 */
type Request = {
    id: string;
    reqSerId: string;
    attendedto: boolean;
    createdAt: bigint;
    updatedAt?: bigint;
};

/**
 * A Construct for a Service Details Payload of Type 'Record' 
 */
type ServicePayload = {
    servicename: string;
    description: string;
};

/**
 * A Construct for a Client Details Payload of Type 'Record' 
 */
type ClientPayload = {
    firstname: string;
    lastname: string;
    email: string;
    phone: bigint;
};

/**
 * Data Storage Location for Services, Clients, and Requests Details 'Record', of Type 'StableBTreeMap' 
 */
const serviceStorage = new Map<string, Service>();
const clientStorage = new Map<string, Client>();
const requestStorage = new Map<string, Request>();

/**
 * Called to Retrieve All Created Services On the Canister
 */
export function getServices(): Service[] {
    return Array.from(serviceStorage.values());
}

/**
 * Called to Retrieve All Created Clients On the Canister
 */
export function getClients(): Client[] {
    return Array.from(clientStorage.values());
}

/**
 * Called to Retrieve A Created Service on the Canister parsing the 'Service Id' as a parameter
 */
export function getService(id: string): Service | null {
    return serviceStorage.get(id) || null;
}

/**
 * Called to Retrieve A Created Client  on the Canister parsing the 'Client Id' as a parameter
 */
export function getClient(id: string): Client | null {
    return clientStorage.get(id) || null;
}

/**
 * Called to Retrieve A Client Requests on the Canister parsing the 'Client Id' as a parameter
 */
export function getClientsRequest(id: string): Request[] | null {
    const client = clientStorage.get(id);
    return client ? client.requests : null;
}

/**
 * Called to Add a New Service to the Canister parsing the 'Service Payload' as a parameter
 */
export function addService(payload: ServicePayload): Service {
    if (payload.servicename.length <= 0 || payload.description.length <= 0) {
        throw new Error('Invalid input');
    }

    const service: Service = {
        id: uuidv4(),
        requestcount: 0,
        createdAt: BigInt(Date.now()),
        ...payload,
    };
    serviceStorage.set(service.id, service);
    return service;
}

/**
 * Called to Add a New Client to the Canister parsing the 'Client Payload' as a parameter
 */
export function addClient(payload: ClientPayload): Client {
    if (payload.firstname.length <= 0 || payload.lastname.length <= 0 || payload.email.length <= 0) {
        throw new Error('Invalid input');
    }

    const client: Client = {
        id: uuidv4(),
        createdAt: BigInt(Date.now()),
        requests: [],
        ...payload,
    };
    clientStorage.set(client.id, client);
    return client;
}

/**
 * Called from a Client to Request a Created Service on the Canister parsing the 'Service Id' and 
 * 'Client Id' as parameters
 */
export function requestService(sid: string, cid: string): Request {
    const service = serviceStorage.get(sid);
    if (!service) {
        throw new Error(`A service with id=${sid} not found`);
    }

    const client = clientStorage.get(cid);
    if (!client) {
        throw new Error(`A client with id=${cid} not found`);
    }

    const newRequest: Request = {
        id: uuidv4(),
        reqSerId: service.id,
        attendedto: false,
        createdAt: BigInt(Date.now()),
    };

    serviceStorage.set(service.id, {
        ...service,
        requestcount: service.requestcount + 1,
        updatedAt: BigInt(Date.now()),
    });

    clientStorage.set(client.id, {
        ...client,
        updatedAt: BigInt(Date.now()),
        requests: [...client.requests, newRequest],
    });

    requestStorage.set(newRequest.id, newRequest);

    return newRequest;
}

// ... rest of the existing functions remain unchanged

// Example usage:
const newService: Service = addService({ servicename: "Web Development", description: "Web development services" });
const newClient: Client = addClient({ firstname: "John", lastname: "Doe", email: "john@example.com", phone: BigInt(1234567890) });
const newRequest: Request = requestService(newService.id, newClient.id);
