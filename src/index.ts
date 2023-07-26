// cannister code goes here
import {
  $query,
  $update,
  Record,
  StableBTreeMap,
  Vec,
  match,
  Result,
  nat64,
  ic,
  nat8,
  Opt,
  int64,
} from "azle";
import { v4 as uuidv4 } from "uuid";

/**
 * A Construct for a Client Details of Type 'Record'
 */
type Client = Record<{
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: int64;
  requests: Vec<
    Record<{
      id: string;
      reqSerId: string;
      attendedto: boolean;
      createdAt: nat64;
      updatedAt: Opt<nat64>;
    }>
  >;
  createdAt: nat64;
  updatedAt: Opt<nat64>;
}>;

/**
 * A Construct for a Service Details of Type 'Record'
 */
type _Service = Record<{
  id: string;
  servicename: string;
  description: string;
  requestcount: nat8;
  createdAt: nat64;
  updatedAt: Opt<nat64>;
}>;

/**
 * A Construct for a Request Details of Type 'Record'
 */
type Request = Record<{
  id: string;
  reqSerId: string;
  attendedto: boolean;
  createdAt: nat64;
  updatedAt: Opt<nat64>;
}>;

/**
 * A Construct for a Service Details Payload of Type 'Record'
 */
type ServicePayload = Record<{
  servicename: string;
  description: string;
}>;

/**
 * A Construct for a Client Details Payload of Type 'Record'
 */
type ClientPayload = Record<{
  firstname: string;
  lastname: string;
  email: string;
  phone: int64;
}>;

/**
 * Data Storage Location for Services, Clients and Requests Details 'Record', of Type 'StableBTreeMap'
 */
const serviceStorage = new StableBTreeMap<string, _Service>(0, 44, 1024);
const clientStorage = new StableBTreeMap<string, Client>(1, 44, 2048);
const requestStorage = new StableBTreeMap<string, Request>(2, 44, 1024);

/**
 * Called to Retrive All Created Services On the Canister
 */
$query;
export function getServices(): Result<Vec<_Service>, string> {
  try {
    const services = serviceStorage.values();
    if (services.length === 0) {
      return Result.Err("No services found.");
    }
    return Result.Ok(services);
  } catch (error) {
    return Result.Err(`Error fetching services: ${error}`);
  }
}

/**
 * Called to Retrive All Created Clients On the Canister
 */
$query;
export function getClients(): Result<Vec<Client>, string> {
  try {
    const clients = clientStorage.values();
    if (clients.length === 0) {
      return Result.Err("No clients found.");
    }
    return Result.Ok(clients);
  } catch (error) {
    return Result.Err(`Error retrieving clients: ${error}`);
  }
}

/**
 * Called to Retrive A Created Service on the Canister parsing the 'Service Id' as a parameter
 */
$query;
export function getService(id: string): Result<_Service, string> {
  // look-up and return data from serviceStorage with associated id or return Err
  return match(serviceStorage.get(id), {
    Some: (service) => Result.Ok<_Service, string>(service),
    None: () =>
      Result.Err<_Service, string>(`a service with id=${id} not found`),
  });
}

/**
 * Called to Retrive A Created Client  on the Canister parsing the 'Client Id' as a parameter
 */
$query;
export function getClient(id: string): Result<Client, string> {
  // look-up and return data from clientStorage with associated id or return Err
  return match(clientStorage.get(id), {
    Some: (client) => Result.Ok<Client, string>(client),
    None: () => Result.Err<Client, string>(`a client with id=${id} not found`),
  });
}

/**
 * Called to Retrive A Client Requests on the Canister parsing the 'Client Id' as a parameter
 */
$query;
export function getClientsRequest(id: string): Result<Vec<Request>, string> {
  // look-up and return data from clientStorage with associated id or return Err
  return match(clientStorage.get(id), {
    Some: (client) => Result.Ok<Vec<Request>, string>(client.requests),
    None: () =>
      Result.Err<Vec<Request>, string>(`a client with id=${id} not found`),
  });
}

/**
 * Called to Add a New Service to the Canister parsing the 'Service Payload' as a parameter
 */
$update;
export function addService(payload: ServicePayload): Result<_Service, string> {
  try {
    // check if service with same name already exists
    const existingService = serviceStorage
      .values()
      .find((service) => service.servicename === payload.servicename);
    if (existingService)
      return Result.Err<_Service, string>(
        `service with name ${payload.servicename} already exists`
      );

    // create new service object in serviceStorage
    if (payload.description.length <= 0 || payload.servicename.length <= 0)
      return Result.Err<_Service, string>(`invalid input`);
    const service: _Service = {
      id: uuidv4(),
      requestcount: 0,
      createdAt: ic.time(),
      updatedAt: Opt.None,
      ...payload,
    };
    serviceStorage.insert(service.id, service);

    console.log(`Service added: ${service.id}`);
    return Result.Ok(service);
  } catch (error) {
    return Result.Err<_Service, string>(
      `error inserting new service: ${error}`
    );
  }
}

/**
 * Called to Add a New Client to the Canister parsing the 'Client Payload' as a parameter
 */

function isValidPhoneNumber(phone: int64): boolean {
  // Implement phone number validation logic as needed
  // For example, check if the phone is a valid positive integer
  return phone >= 0;
}
$update;
export function addClient(payload: ClientPayload): Result<Client, string> {
  // validates the input values
  if (
    payload.firstname.length === 0 ||
    payload.lastname.length === 0 ||
    payload.email.length === 0 ||
    !isValidPhoneNumber(payload.phone) ||
    !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(payload.email)
  ) {
    return Result.Err<Client, string>(`invalid input`);
  }

  // check if the client already exists
  const existingClients = clientStorage.values();
  const emailTaken = existingClients.some(
    (client) => client.email === payload.email
  );
  if (emailTaken) {
    return Result.Err<Client, string>(`client already exists`);
  }
  const client: Client = {
    id: uuidv4(),
    createdAt: ic.time(),
    updatedAt: Opt.None,
    requests: [],
    ...payload,
  };
  clientStorage.insert(client.id, client);
  return Result.Ok(client);
}

/**
 * Called from a Client to Request a Created Service on the Canister parsing the 'Service Id' and
 * 'Client Id' as parameters
 */
$update;
export function requestService(
  sid: string,
  cid: string
): Result<Request, string> {
  return match(serviceStorage.get(sid), {
    Some: (service) => {
      return match(clientStorage.get(cid), {
        Some: (client) => {
          const newRequest: Request = {
            id: uuidv4(),
            reqSerId: service.id,
            attendedto: false,
            createdAt: ic.time(),
            updatedAt: Opt.None,
          };
          const updatedClient: Client = {
            ...client,
            updatedAt: Opt.Some(ic.time()),
            requests: [...client.requests, { ...newRequest }],
          };
          const updatedService: _Service = {
            ...service,
            requestcount: service.requestcount + 1,
            updatedAt: Opt.Some(ic.time()),
          };
          requestStorage.insert(newRequest.id, { ...newRequest });
          clientStorage.insert(client.id, { ...updatedClient });
          serviceStorage.insert(service.id, { ...updatedService });
          return Result.Ok<Request, string>(newRequest);
        },
        None: () =>
          Result.Err<Request, string>(`a client with id=${cid} not found`),
      });
    },
    None: () =>
      Result.Err<Request, string>(`a service with id=${sid} not found`),
  });
}

/**
 * Called from the Service Creator to CheckOut Served Request on the Canister parsing the 'Client Id' and
 * 'Request Id' as parameters
 */
$update;
export function checkOutRequest(
  cid: string,
  rid: string
): Result<Request, string> {
  // look-up and return data from requestStorage, clientStorage with associated cid & rid
  // and updates returned request and client objects or return Err
  return match(clientStorage.get(cid), {
    Some: (client) => {
      return match(requestStorage.get(rid), {
        Some: (request) => {
          let cli = client.requests;
          let idx = cli.findIndex((id) => id.id === rid);
          // validates the client is associated with the request
          if (idx < 0)
            return Result.Err<Request, string>(
              `couldn't find a request rid=${rid} associated with cid=${cid}.`
            );
          const updateRequest: Request = {
            ...request,
            reqSerId: request.reqSerId,
            attendedto: true,
            updatedAt: Opt.Some(ic.time()),
          };
          requestStorage.insert(request.id, updateRequest);
          const updatedClient: Client = {
            ...client,
            updatedAt: Opt.Some(ic.time()),
          };
          clientStorage.insert(client.id, updatedClient);
          return Result.Ok<Request, string>(updateRequest);
        },
        None: () =>
          Result.Err<Request, string>(`a request with id=${rid} not found`),
      });
    },
    None: () =>
      Result.Err<Request, string>(`a client with id=${cid} not found`),
  });
}

/**
 * Called to Update a Clients Data on the Canister from a Client parsing the 'Client Id' and
 * 'Client Payload' as parameters
 */
$update;
export function updateClient(
  cid: string,
  payload: ClientPayload
): Result<Client, string> {
  // look-up and return data from clientStorage with associated cid
  // and updates returned client object or return Err
  return match(clientStorage.get(cid), {
    Some: (client) => {
      // validates the phone input value
      if (
        payload.firstname.length <= 0 ||
        payload.lastname.length <= 0 ||
        payload.email.length <= 0
      )
        return Result.Err<Client, string>(`invalid input`);
      const updatedClient: Client = {
        ...client,
        ...payload,
        updatedAt: Opt.Some(ic.time()),
      };
      clientStorage.insert(client.id, updatedClient);
      return Result.Ok<Client, string>(updatedClient);
    },
    None: () => Result.Err<Client, string>(`a client with id=${cid} not found`),
  });
}

/**
 * Called to a Update Service Data on the Canister from a Service Creator parsing the 'Service Id' and
 * 'Service Payload' as parameters
 */
$update;
export function updateService(
  sid: string,
  payload: ServicePayload
): Result<_Service, string> {
  // look-up and return data from serviceStorage with associated sid
  // and updates returned service object or return Err
  return match(serviceStorage.get(sid), {
    Some: (service) => {
      if (payload.description.length <= 0 || payload.servicename.length <= 0)
        return Result.Err<_Service, string>(`invalid input`);
      const updatedService: _Service = {
        ...service,
        ...payload,
        updatedAt: Opt.Some(ic.time()),
      };
      serviceStorage.insert(service.id, updatedService);
      return Result.Ok<_Service, string>(updatedService);
    },
    None: () =>
      Result.Err<_Service, string>(`a service with id=${sid} not found`),
  });
}

/**
 * Called to Delete a Client from the Canister parsing the 'Client Id' as a parameter.
 */
$update;
export function deleteClient(id: string): Result<Client, string> {
  // look-up and delete data from clientStorage with associated id or return Err
  return match(clientStorage.get(id), {
    Some: (deletedclient) => {
      deletedclient.requests.forEach((r) => {
        requestStorage.remove(r.id);
      });
      clientStorage.remove(id);
      return Result.Ok<Client, string>(deletedclient);
    },
    None: () =>
      Result.Err<Client, string>(
        `couldn't delete a client with id=${id}. message not found.`
      ),
  });
}

/**
 * Called to Delete a Service from the Canister parsing the 'Service Id' as a parameter.
 */
$update;
export function deleteService(id: string): Result<_Service, string> {
  // look-up and delete data from serviceStorage with associated id or return Err
  return match(serviceStorage.get(id), {
    Some: (service) => {
      let requests = requestStorage.values();
      let idx = requests.findIndex(
        (rid) => rid.reqSerId === id && rid.attendedto === false
      );
      // validates all clients where attended to before deleting the service
      if (idx >= 0)
        return Result.Err<_Service, string>(
          `couldn't delete a service with id=${id}. clients request not attended to.`
        );
      serviceStorage.remove(id);
      return Result.Ok<_Service, string>(service);
    },
    None: () =>
      Result.Err<_Service, string>(
        `couldn't delete a service with id=${id}. message not found.`
      ),
  });
}

globalThis.crypto = {
  //@ts-ignore
  getRandomValues: () => {
    let array = new Uint8Array(32);

    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }

    return array;
  },
};
