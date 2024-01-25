import PQueue from 'p-queue';

export class MessageQueue {

    private static _queue: PQueue = new PQueue();

    public static async enqueue(message: string): Promise<void> {
        await MessageQueue._queue.add(() => {
            // Process the message here
            console.log(`Message received: ${message}`);
        });
    }

}

export default MessageQueue;
