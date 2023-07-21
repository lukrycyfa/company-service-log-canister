# company-service-log-canister
Basically a canister developed to run on the ICP (Internet Computer Protocol) written in typeScript and libraries from the Azle framework CDK (Canister Development Kit), having functionalities and utilities to assist in managing a companies services, clients and keeping track of clients requests made to services and logs with a CRUD modal.



### Instructions on Deploying and Testing the Canister  🛠.
- To make use or test this canister locally you will be requiring the following installed in your local environment.

- [Node.js](https://nodejs.org/en/download). v18 or >.

- clone the projects repo

```bash
git clone https://github.com/lukrycyfa/company-service-log-canister.git
```
- install dependencies

```bash
cd company-service-log-canister
npm install
```
- Or you optionaly use Github Codespaces to test the project by following this link [company-service-log](https://github.com/lukrycyfa/company-service-log-canister), clicking on the "Code" button, then select "Create codespace on the main tab". to generate a new Codespace, pre-configured with everything you need to start building this project.

#### Setting up the terminal
- Install node version manager (NVM)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```
- Switch to node v18 by issuing

```bash
nvm use 18
```
- Install DFX the command line interface for the Internet Computer

```bash
DFX_VERSION=0.14.1 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```
- Add DFX to your path

```bash
echo 'export PATH="$PATH:$HOME/bin"' >> "$HOME/.bashrc"
```
- Restart your terminal if you must..

- Start your Internet Computer replica.

```bash
dfx start --background
```
- Deploy the canister

```bash
dfx deploy
```
- After the deployment is complete, you will be provided a link to your canister on the terminal. follow the link to interact with the candid interface on your browser.

#### Function Calls and Args..
- `getServices()` returns the created services on the canister.
- `getClients()` returns the created clients on the canister.
- `getService(id: string)` returns the service on the canister associated to the id provided.
- `getClient(id: string)` returns the client on the canister associated to the id provided.
- `getClientRequest(id: string)` returns the client requests on the canister associated to the id provided.
- `addService(payload: ServicePayload)` creates a new service instance on the canister, where `payload` is the service data.
- `addClient(payload: ServiceClient)` creates a new client instance on the canister, where `payload` is the clients data.
- `requestService(sid: string, cid: string)` creates a new request instance on the canister, where `sid` is the service Id and `cid` is the Id to the client requesting the service.
- `checkOutRequest(cid: string, rid: string)` called to check-out a served clients request, where `cid` is the clients Id and `rid` is the Id to the request to be checked-out.
- `updateClient(cid: string,  payload:ClientPayload)` called to update an existing client instance, where `cid` is the clients Id and `payload` is the data to be updated. 
- `updateService(sid: string,  payload:ServicePayload)` called to update an existing service instance, where `sid` is the service Id and `payload` is the data to be updated.
- `deleteClient(id: string)` called to delete a client instance with the provided 'id'.
- `deleteService(id: string)` called to delete a service instance with the provided 'id'.

##### Examples function calls.

```bash
dfx canister call company_service_log the-function '("args", "args")'
```
- example
```bash
dfx canister call company_service_log getService '("79daba82-18ce-4f69-afa1-7b3389368d1f")'
```