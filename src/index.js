import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

// Apollo Config
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import { ApolloProvider, createNetworkInterface, ApolloClient } from 'react-apollo'
import { BrowserRouter } from 'react-router-dom'
import { GC_AUTH_TOKEN } from './constants'

const networkInterface = createNetworkInterface({
    uri: 'https://api.graph.cool/simple/v1/cj4zrdxi6u69r0196lkntqhhi'
})

// Subscription config
const wsClient = new SubscriptionClient('wss://subscriptions.graph.cool/v1/cj4zrdxi6u69r0196lkntqhhi', {
    reconnect: true,
    connectionParams: {
        authToken: localStorage.getItem(GC_AUTH_TOKEN),
    }
})

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
    networkInterface,
    wsClient
)

// Ensure that every API call to graphCool is utilizing their Auth token
// On graphcool you can configure authorization rules to define allowed operations for authenticated vs non-authenticated users
networkInterface.use([{
    applyMiddleware(req, next) {
        if (!req.options.headers) {
            req.options.headers = {}
        }
        const token = localStorage.getItem(GC_AUTH_TOKEN)
        req.options.headers.authorization = token ? `Bearer ${token}` : null
        next()
    }
}])

const client = new ApolloClient({
    networkInterface: networkInterfaceWithSubscriptions
})

ReactDOM.render(
    <BrowserRouter>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </BrowserRouter>
    , document.getElementById('root')
)
registerServiceWorker();
