# Event System

In Sifodyas, a very basic event hub is built in. This system allows you interact with kernel and other business component of your layer without having any a direct dependency to them.  
The event system is also used to be aware of many steps of the lifecycle.

Three main components are used: the `EventPublisher`, the `EventSubscriber`, and the event object implementing `IEvent`

## `EventPublisher`
This service allows you to send events to whoever wants to listen to them. It's accessible with `event_publisher` service id.  
The whole event map is stored in this object and even it can be directly manipulated, it **only** for internal uses.

```ts
class MyBundle extends Bundle {
    public boot() {
        const eventPublisher = this.container.get('event_publisher');
        // This event is not really revelant because it will be fired only during boot phase
        // and their is a low chance that someone is already ready to listen to it.
        eventPublisher.publish('myBundle.myEvent', new MyEvent());
    }
}
```

## `EventSubscriber`
This subscriber helps you consume what is produced with the publisher. It's accessible with `event_subscriber` service id.  
You can setup a callback function like a classic emit emitter class, but you also can asynchronously iterate over each event published which can be pretty usefull in a event stream situation. But remember that `iterate` method is still experimental.

```ts
class MyBundle extends Bundle {
    public async boot() {
        const eventSubscriber = this.container.get('event_subscriber');

        const onGetParameter = (evt: ContainerEvent) => {
            console.log(evt.getState());
        }
        // classic subsribe to a container event
        eventSubscriber.subscribe('event.container.getParameter', onGetParameter);

        // you should give the same function that you used on subscribe to be able to unsubscribe. Behind the scene, your function is used as "id".
        eventSubscriber.unsubscribe('event.container.getParameter', onGetParameter);

        // iterate over each event published. On each iteration, an event is yielded.
        // this should mostly be set in a worker of some sort.
        // because the event stream is "infinite" the only way to unsubscribe is by breaking the loop.
        for await (const evt of eventSubscriber.iterate('event.container.getParameter')) {
            onGetParameter(evt);
        }
    }
}
```

## Event Object
TBD
