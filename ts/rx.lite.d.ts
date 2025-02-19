declare module Rx {

    // Type alias for observables and promises
    

    

    // Type alias for arrays and array like objects
    

    /**
     * Promise A+
     */
    export interface Promise<T> {
        then<R>(onFulfilled: (value: T) => R|Promise<R>, onRejected: (error: any) => Promise<R>): Promise<R>;
        then<R>(onFulfilled: (value: T) => R|Promise<R>, onRejected?: (error: any) => R): Promise<R>;
    }

    /**
     * Promise A+
     */
    export interface IPromise<T> extends Promise<T> { }

    /**
    * Represents a push-style collection.
    */
    export interface IObservable<T> { }

    /**
    * Represents a push-style collection.
    */
    export interface Observable<T> extends IObservable<T> { }

    export module internals {
        export interface EmptyError extends Error { message: string; }
        export interface EmptyErrorStatic { new (): EmptyError; }

        export interface ObjectDisposedError extends Error { message: string; }
        export interface ObjectDisposedErrorStatic { new (): ObjectDisposedError; }

        export interface ArgumentOutOfRangeError extends Error { message: string; }
        export interface ArgumentOutOfRangeErrorStatic { new (): ArgumentOutOfRangeError; }

        export interface NotSupportedError extends Error { message: string; }
        export interface NotSupportedErrorStatic { new (): NotSupportedError; }

        export interface NotImplementedError extends Error { message: string; }
        export interface NotImplementedErrorStatic { new (): NotImplementedError; }
    }

    export module helpers {
        export var notImplemented: () => internals.NotImplementedError;
        export var notSupported: () => internals.NotSupportedError;
    }

    export module internals {
        export var bindCallback: (func: Function, thisArg: any, argCount: number) => Function;
    }

    export module internals {
        export var isEqual : (left: any, right: any) => boolean;
    }

    export interface IDisposable {
        dispose(): void;
    }

    export interface Disposable extends IDisposable {
        /** Is this value disposed. */
        isDisposed?: boolean;
    }

    interface DisposableStatic {
        /**
         * Provides a set of static methods for creating Disposables.
         * @param {Function} dispose Action to run during the first call to dispose. The action is guaranteed to be run at most once.
         */
        new (action: () => void): Disposable;

        /**
         * Creates a disposable object that invokes the specified action when disposed.
         * @param {Function} dispose Action to run during the first call to dispose. The action is guaranteed to be run at most once.
         * @return {Disposable} The disposable object that runs the given action upon disposal.
         */
        create(action: () => void): Disposable;

        /**
         * Gets the disposable that does nothing when disposed.
         */
        empty: IDisposable;

        /**
         * Validates whether the given object is a disposable
         * @param {Object} Object to test whether it has a dispose method
         * @returns {Boolean} true if a disposable object, else false.
         */
        isDisposable(d: any): boolean;
    }

    /**
     * Provides a set of static methods for creating Disposables.
     * @param {Function} dispose Action to run during the first call to dispose. The action is guaranteed to be run at most once.
     */
    export var Disposable: DisposableStatic;

    export module config {
        export var Promise: { new <T>(resolver: (resolvePromise: (value: T) => void, rejectPromise: (reason: any) => void) => void): IPromise<T>; };
    }

    export module helpers {
        export var noop: () => void;
        export var notDefined: (value: any) => boolean;
        export var identity: <T>(value: T) => T;
        export var defaultNow: () => number;
        export var defaultComparer: (left: any, right: any) =>  boolean;
        export var defaultSubComparer: (left: any, right: any) =>  number;
        export var defaultKeySerializer: (key: any) =>  string;
        export var defaultError: (err: any) =>  void;
        export var isPromise: (p: any) =>  boolean;
        export var asArray: <T>(...args: T[]) =>  T[];
        export var not: (value: any) =>  boolean;
        export var isFunction: (value: any) =>  boolean;
    }

    
    
    
    
    

    export module special {
        
    }

    export interface IObservable<T> {
        /**
        *  Subscribes an o to the observable sequence.
        *  @param {Mixed} [oOrOnNext] The object that is to receive notifications or an action to invoke for each element in the observable sequence.
        *  @param {Function} [onError] Action to invoke upon exceptional termination of the observable sequence.
        *  @param {Function} [onCompleted] Action to invoke upon graceful termination of the observable sequence.
        *  @returns {Diposable} A disposable handling the subscriptions and unsubscriptions.
        */
        subscribe(observer: IObserver<T>): IDisposable;
        /**
        *  Subscribes an o to the observable sequence.
        *  @param {Mixed} [oOrOnNext] The object that is to receive notifications or an action to invoke for each element in the observable sequence.
        *  @param {Function} [onError] Action to invoke upon exceptional termination of the observable sequence.
        *  @param {Function} [onCompleted] Action to invoke upon graceful termination of the observable sequence.
        *  @returns {Diposable} A disposable handling the subscriptions and unsubscriptions.
        */
        subscribe(onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void): IDisposable;
    }

    export interface Observable<T> {
        /**
        *  Subscribes an o to the observable sequence.
        *  @param {Mixed} [oOrOnNext] The object that is to receive notifications or an action to invoke for each element in the observable sequence.
        *  @param {Function} [onError] Action to invoke upon exceptional termination of the observable sequence.
        *  @param {Function} [onCompleted] Action to invoke upon graceful termination of the observable sequence.
        *  @returns {Diposable} A disposable handling the subscriptions and unsubscriptions.
        */
        subscribe(observer: IObserver<T>): IDisposable;
        /**
        *  Subscribes an o to the observable sequence.
        *  @param {Mixed} [oOrOnNext] The object that is to receive notifications or an action to invoke for each element in the observable sequence.
        *  @param {Function} [onError] Action to invoke upon exceptional termination of the observable sequence.
        *  @param {Function} [onCompleted] Action to invoke upon graceful termination of the observable sequence.
        *  @returns {Diposable} A disposable handling the subscriptions and unsubscriptions.
        */
        subscribe(onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void): IDisposable;

        /**
        * Subscribes to the next value in the sequence with an optional "this" argument.
        * @param {Function} onNext The function to invoke on each element in the observable sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
        */
        subscribeOnNext(onNext: (value: T) => void, thisArg?: any): IDisposable;
        /**
        * Subscribes to an exceptional condition in the sequence with an optional "this" argument.
        * @param {Function} onError The function to invoke upon exceptional termination of the observable sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
        */
        subscribeOnError(onError: (exception: any) => void, thisArg?: any): IDisposable;
        /**
        * Subscribes to the next value in the sequence with an optional "this" argument.
        * @param {Function} onCompleted The function to invoke upon graceful termination of the observable sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
        */
        subscribeOnCompleted(onCompleted: () => void, thisArg?: any): IDisposable;

        /**
        *  Subscribes an o to the observable sequence.
        *  @param {Mixed} [oOrOnNext] The object that is to receive notifications or an action to invoke for each element in the observable sequence.
        *  @param {Function} [onError] Action to invoke upon exceptional termination of the observable sequence.
        *  @param {Function} [onCompleted] Action to invoke upon graceful termination of the observable sequence.
        *  @returns {Diposable} A disposable handling the subscriptions and unsubscriptions.
        */
        forEach(observer: IObserver<T>): IDisposable;

        /**
        *  Subscribes an o to the observable sequence.
        *  @param {Mixed} [oOrOnNext] The object that is to receive notifications or an action to invoke for each element in the observable sequence.
        *  @param {Function} [onError] Action to invoke upon exceptional termination of the observable sequence.
        *  @param {Function} [onCompleted] Action to invoke upon graceful termination of the observable sequence.
        *  @returns {Diposable} A disposable handling the subscriptions and unsubscriptions.
        */
        forEach(onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void): IDisposable;
    }

    export interface ObservableStatic {
        /**
        * Determines whether the given object is an Observable
        * @param {Any} An object to determine whether it is an Observable
        * @returns {Boolean} true if an Observable, else false.
        */
        isObservable(o: any): boolean;
    }

    export var Observable: ObservableStatic;

    export module internals {
        export var inherits: (child: any, parent: any) => void;
        export var addProperties: (obj: any, ...sources: any[]) => void;
        export var addRef: <T>(xs: Observable<T>, r: { getDisposable(): IDisposable; }) => Observable<T>;
    }

    /**
     * Represents a group of disposable resources that are disposed together.
     * @constructor
     */
    export interface CompositeDisposable extends Disposable {
        /**
         * Adds a disposable to the CompositeDisposable or disposes the disposable if the CompositeDisposable is disposed.
         * @param {Mixed} item Disposable to add.
         */
        add(item: IDisposable): void;

        /**
         * Removes and disposes the first occurrence of a disposable from the CompositeDisposable.
         * @param {Mixed} item Disposable to remove.
         * @returns {Boolean} true if found; false otherwise.
         */
        remove(item: IDisposable): void;
    }

    interface CompositeDisposableStatic {
        /**
         * Represents a group of disposable resources that are disposed together.
         * @constructor
         */
        new (...disposables: Rx.IDisposable[]): CompositeDisposable;
        /**
         * Represents a group of disposable resources that are disposed together.
         * @constructor
         */
        new(disposables: Rx.IDisposable[]): CompositeDisposable;
    }

    export var CompositeDisposable: CompositeDisposableStatic;

    export interface SingleAssignmentDisposable {
        /** Performs the task of cleaning up resources. */
        dispose(): void;

        /** Is this value disposed. */
        isDisposed: boolean;

        getDisposable(): IDisposable;

        setDisposable(value: IDisposable): void;
    }

    interface SingleAssignmentDisposableStatic {
        new() : SingleAssignmentDisposable;
    }

    export var SingleAssignmentDisposable : SingleAssignmentDisposableStatic;

    export interface SerialDisposable {
        /** Performs the task of cleaning up resources. */
        dispose(): void;

        /** Is this value disposed. */
        isDisposed: boolean;

        getDisposable(): IDisposable;

        setDisposable(value: IDisposable): void;
    }

    interface SerialDisposableStatic {
        new() : SerialDisposable;
    }

    export var SerialDisposable : SerialDisposableStatic;

    /**
     * Represents a disposable resource that only disposes its underlying disposable resource when all dependent disposable objects have been disposed.
     */
    export interface RefCountDisposable extends Disposable {

        /** Performs the task of cleaning up resources. */
        dispose(): void;

        /** Is this value disposed. */
        isDisposed: boolean;

        /**
         * Returns a dependent disposable that when disposed decreases the refcount on the underlying disposable.
         * @returns {Disposable} A dependent disposable contributing to the reference count that manages the underlying disposable's lifetime.
         */
        getDisposable(): IDisposable;
    }

    interface RefCountDisposableStatic {
        /**
         * Initializes a new instance of the RefCountDisposable with the specified disposable.
         * @constructor
         * @param {Disposable} disposable Underlying disposable.
         */
        new(disposable: IDisposable): RefCountDisposable;
    }

    export var RefCountDisposable : RefCountDisposableStatic;

    export interface IScheduler {
        /**
        * Schedules an action to be executed.
        * @param {Function} action Action to execute.
        * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
        */
        schedule(action: () => void): IDisposable;

        /**
         * Schedules an action to be executed.
         * @param state State passed to the action to be executed.
         * @param {Function} action Action to be executed.
         * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
         */
        scheduleWithState<TState>(state: TState, action: (scheduler: IScheduler, state: TState) => IDisposable): IDisposable;

        /**
         * Schedules an action to be executed after the specified relative due time.
         * @param {Function} action Action to execute.
         * @param {Number} dueTime Relative time after which to execute the action.
         * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
         */
        scheduleWithRelative(dueTime: number, action: () => void): IDisposable;

        /**
         * Schedules an action to be executed after dueTime.
         * @param state State passed to the action to be executed.
         * @param {Function} action Action to be executed.
         * @param {Number} dueTime Relative time after which to execute the action.
         * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
         */
        scheduleWithRelativeAndState<TState>(state: TState, dueTime: number, action: (scheduler: IScheduler, state: TState) => IDisposable): IDisposable;

        /**
         * Schedules an action to be executed at the specified absolute due time.
         * @param {Function} action Action to execute.
         * @param {Number} dueTime Absolute time at which to execute the action.
         * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
          */
        scheduleRecursiveWithAbsolute(dueTime: number, action: (action: (dueTime: number) => void) => void): IDisposable;

        /**
         * Schedules an action to be executed at dueTime.
         * @param {Mixed} state State passed to the action to be executed.
         * @param {Function} action Action to be executed.
         * @param {Number}dueTime Absolute time at which to execute the action.
         * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
         */
        scheduleRecursiveWithAbsoluteAndState<TState>(state: TState, dueTime: number, action: (state: TState, action: (state: TState, dueTime: number) => void) => void): IDisposable;
    }

    export interface SchedulerStatic {
        new (
        now: () => number,
        schedule: (state: any, action: (scheduler: IScheduler, state: any) => IDisposable) => IDisposable,
        scheduleRelative: (state: any, dueTime: number, action: (scheduler: IScheduler, state: any) => IDisposable) => IDisposable,
        scheduleAbsolute: (state: any, dueTime: number, action: (scheduler: IScheduler, state: any) => IDisposable) => IDisposable): Rx.IScheduler;

        /** Gets the current time according to the local machine's system clock. */
        now: number;

        /**
         * Normalizes the specified TimeSpan value to a positive value.
         * @param {Number} timeSpan The time span value to normalize.
         * @returns {Number} The specified TimeSpan value if it is zero or positive; otherwise, 0
         */
        normalize(timeSpan: number): number;
    }

    /** Provides a set of static properties to access commonly used schedulers. */
    export var Scheduler: SchedulerStatic;

    export module internals {
        export interface ScheduledItem<TTime> {
            scheduler: IScheduler;
            state: TTime;
            action: (scheduler: IScheduler, state: any) => IDisposable;
            dueTime: TTime;
            comparer: (x: TTime, y: TTime) => number;
            disposable: SingleAssignmentDisposable;

            invoke(): void;
            compareTo(other: ScheduledItem<TTime>): number;
            isCancelled(): boolean;
            invokeCore(): IDisposable;
        }

        interface ScheduledItemStatic {
            new <TTime>(scheduler: IScheduler, state: any, action: (scheduler: IScheduler, state: any) => IDisposable, dueTime: TTime, comparer?: ((value1: TTime, value2: TTime) => number)):ScheduledItem<TTime>;
        }

        export var ScheduledItem: ScheduledItemStatic
    }

    export interface IScheduler {
        /**
         * Schedules an action to be executed recursively.
         * @param {Function} action Action to execute recursively. The parameter passed to the action is used to trigger recursive scheduling of the action.
         * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
         */
        scheduleRecursive(action: (action: () => void) => void): IDisposable;

        /**
         * Schedules an action to be executed recursively.
         * @param {Mixed} state State passed to the action to be executed.
         * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in recursive invocation state.
         * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
         */
        scheduleRecursiveWithState<TState>(state: TState, action: (state: TState, action: (state: TState) => void) => void): IDisposable;

        /**
         * Schedules an action to be executed recursively after a specified relative due time.
         * @param {Function} action Action to execute recursively. The parameter passed to the action is used to trigger recursive scheduling of the action at the specified relative time.
         * @param {Number}dueTime Relative time after which to execute the action for the first time.
         * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
         */
        scheduleRecursiveWithRelative(dueTime: number, action: (action: (dueTime: number) => void) => void): IDisposable;

        /**
         * Schedules an action to be executed recursively after a specified relative due time.
         * @param {Mixed} state State passed to the action to be executed.
         * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in the recursive due time and invocation state.
         * @param {Number}dueTime Relative time after which to execute the action for the first time.
         * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
         */
        scheduleRecursiveWithRelativeAndState<TState>(state: TState, dueTime: number, action: (state: TState, action: (state: TState, dueTime: number) => void) => void): IDisposable;

        /**
         * Schedules an action to be executed recursively at a specified absolute due time.
         * @param {Function} action Action to execute recursively. The parameter passed to the action is used to trigger recursive scheduling of the action at the specified absolute time.
         * @param {Number}dueTime Absolute time at which to execute the action for the first time.
         * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
         */
        scheduleRecursiveWithAbsolute(dueTime: number, action: (action: (dueTime: number) => void) => void): IDisposable;

        /**
         * Schedules an action to be executed recursively at a specified absolute due time.
         * @param {Mixed} state State passed to the action to be executed.
         * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in the recursive due time and invocation state.
         * @param {Number}dueTime Absolute time at which to execute the action for the first time.
         * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
         */
        scheduleRecursiveWithAbsoluteAndState<TState>(state: TState, dueTime: number, action: (state: TState, action: (state: TState, dueTime: number) => void) => void): IDisposable;
    }

    export interface IScheduler {
        /**
         * Schedules a periodic piece of work by dynamically discovering the scheduler's capabilities. The periodic task will be scheduled using window.setInterval for the base implementation.
         * @param {Number} period Period for running the work periodically.
         * @param {Function} action Action to be executed.
         * @returns {Disposable} The disposable object used to cancel the scheduled recurring action (best effort).
         */
        schedulePeriodic(period: number, action: () => void): IDisposable;

        /**
         * Schedules a periodic piece of work by dynamically discovering the scheduler's capabilities. The periodic task will be scheduled using window.setInterval for the base implementation.
         * @param {Mixed} state Initial state passed to the action upon the first iteration.
         * @param {Number} period Period for running the work periodically.
         * @param {Function} action Action to be executed, potentially updating the state.
         * @returns {Disposable} The disposable object used to cancel the scheduled recurring action (best effort).
         */
        schedulePeriodicWithState<TState>(state: TState, period: number, action: (state: TState) => TState): IDisposable;
    }

    export interface SchedulerStatic {
        immediate: IScheduler;
    }

    export interface ICurrentThreadScheduler extends IScheduler {
        scheduleRequired(): boolean;
    }

    export interface SchedulerStatic {
        currentThread: ICurrentThreadScheduler;
    }

    export module internals {
        export interface SchedulePeriodicRecursive {
            start(): IDisposable;
        }

        interface SchedulePeriodicRecursiveStatic {
            new (scheduler: any, state: any, period: any, action: any) : SchedulePeriodicRecursive;
        }

        export var SchedulePeriodicRecursive: SchedulePeriodicRecursiveStatic;
    }

    export interface SchedulerStatic {
        timeout: IScheduler;
        default: IScheduler;
    }

    /**
    * Supports push-style iteration over an observable sequence.
    */
    export interface IObserver<T> {
        /**
        * Notifies the observer of a new element in the sequence.
        * @param {Any} value Next element in the sequence.
        */
        onNext(value: T): void;
        /**
        * Notifies the observer that an exception has occurred.
        * @param {Any} error The error that has occurred.
        */
        onError(exception: any): void;
        /**
        * Notifies the observer of the end of the sequence.
        */
        onCompleted(): void;
    }
    
    export interface Observer<T> {
        /**
        * Notifies the observer of a new element in the sequence.
        * @param {Any} value Next element in the sequence.
        */
        onNext(value: T): void;
        /**
        * Notifies the observer that an exception has occurred.
        * @param {Any} error The error that has occurred.
        */
        onError(exception: any): void;
        /**
        * Notifies the observer of the end of the sequence.
        */
        onCompleted(): void;
    }

    export interface ObserverStatic {
        /**
        *  Creates an observer from the specified OnNext, along with optional OnError, and OnCompleted actions.
        * @param {Function} [onNext] Observer's OnNext action implementation.
        * @param {Function} [onError] Observer's OnError action implementation.
        * @param {Function} [onCompleted] Observer's OnCompleted action implementation.
        * @returns {Observer} The observer object implemented using the given actions.
        */
        create<T>(onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void): Observer<T>;
    }

    /**
    * Supports push-style iteration over an observable sequence.
    */
    export var Observer: ObserverStatic;

    /**
     *  Represents a notification to an observer.
     */
    export interface Notification<T> {
        /**
         * Invokes the delegate corresponding to the notification or the observer's method corresponding to the notification and returns the produced result.
         *
         * @memberOf Notification
         * @param {Any} observerOrOnNext Delegate to invoke for an OnNext notification or Observer to invoke the notification on..
         * @param {Function} onError Delegate to invoke for an OnError notification.
         * @param {Function} onCompleted Delegate to invoke for an OnCompleted notification.
         * @returns {Any} Result produced by the observation.
         */
        accept(observer: IObserver<T>): void;
        /**
         * Invokes the delegate corresponding to the notification or the observer's method corresponding to the notification and returns the produced result.
         *
         * @memberOf Notification
         * @param {Any} observerOrOnNext Delegate to invoke for an OnNext notification or Observer to invoke the notification on..
         * @param {Function} onError Delegate to invoke for an OnError notification.
         * @param {Function} onCompleted Delegate to invoke for an OnCompleted notification.
         * @returns {Any} Result produced by the observation.
         */
        accept<TResult>(onNext: (value: T) => TResult, onError?: (exception: any) => TResult, onCompleted?: () => TResult): TResult;

        /**
         * Returns an observable sequence with a single notification.
         *
         * @memberOf Notifications
         * @param {Scheduler} [scheduler] Scheduler to send out the notification calls on.
         * @returns {Observable} The observable sequence that surfaces the behavior of the notification upon subscription.
         */
        toObservable(scheduler?: IScheduler): Observable<T>;

        hasValue: boolean;
        equals(other: Notification<T>): boolean;
        kind: string;
        value: T;
        exception: any;
    }

    interface NotificationStatic {
        new <T>(kind: any, value: any, exception: any, accept: any, acceptObservable: any, toString: any) : Notification<T>;

        /**
        * Creates an object that represents an OnNext notification to an observer.
        * @param {Any} value The value contained in the notification.
        * @returns {Notification} The OnNext notification containing the value.
        */
        createOnNext<T>(value: T): Notification<T>;
        /**
        * Creates an object that represents an OnError notification to an observer.
        * @param {Any} error The exception contained in the notification.
        * @returns {Notification} The OnError notification containing the exception.
        */
        createOnError<T>(exception: any): Notification<T>;
        /**
        * Creates an object that represents an OnCompleted notification to an observer.
        * @returns {Notification} The OnCompleted notification.
        */
        createOnCompleted<T>(): Notification<T>;
    }

    export var Notification : NotificationStatic;

    export module internals {
        /**
        * Abstract base class for implementations of the Observer class.
        * This base class enforces the grammar of observers where OnError and OnCompleted are terminal messages.
        */
        export interface AbstractObserver<T> extends Rx.IObserver<T>, Rx.IDisposable {
            /**
            * Notifies the observer of a new element in the sequence.
            * @param {Any} value Next element in the sequence.
            */
            onNext(value: T): void;
            /**
            * Notifies the observer that an exception has occurred.
            * @param {Any} error The error that has occurred.
            */
            onError(exception: any): void;
            /**
            * Notifies the observer of the end of the sequence.
            */
            onCompleted(): void;

            isStopped: boolean;

            /**
            * Disposes the observer, causing it to transition to the stopped state.
            */
            dispose(): void;

            fail(e: any): boolean;

            // Must be implemented by other observers
            next(value: T): void;
            error(error: any): void;
            completed(): void;
        }

        interface AbstractObserverStatic {
            new <T>(): AbstractObserver<T>;
        }

        export var AbstractObserver: AbstractObserverStatic
    }

    /**
     * Class to create an Observer instance from delegate-based implementations of the on* methods.
     */
    export interface AnonymousObserver<T> extends Observer<T> {
        /**
        * Notifies the observer of a new element in the sequence.
        * @param {Any} value Next element in the sequence.
        */
        onNext(value: T): void;
        /**
        * Notifies the observer that an exception has occurred.
        * @param {Any} error The error that has occurred.
        */
        onError(exception: any): void;
        /**
        * Notifies the observer of the end of the sequence.
        */
        onCompleted(): void;
    }

    interface AnonymousObserverStatic {
        /**
         * Creates an observer from the specified OnNext, OnError, and OnCompleted actions.
         * @param {Any} onNext Observer's OnNext action implementation.
         * @param {Any} onError Observer's OnError action implementation.
         * @param {Any} onCompleted Observer's OnCompleted action implementation.
         */
        new <T>(onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void): AnonymousObserver<T>;
    }

    export var AnonymousObserver : AnonymousObserverStatic;

    export module internals {
        export interface ScheduledObserver<T> extends Observer<T> {
            ensureActive(): void;
        }
    }

    export interface Observable<T> {
        /**
        * Creates an array from an observable sequence.
        * @returns {Observable} An observable sequence containing a single element with a list containing all the elements of the source sequence.
        */
        toArray(): Observable<T[]>;
    }

    export interface ObservableStatic {
        /**
        *  Creates an observable sequence from a specified subscribe method implementation.
        * @example
        *  var res = Rx.Observable.create(function (observer) { return function () { } );
        *  var res = Rx.Observable.create(function (observer) { return Rx.Disposable.empty; } );
        *  var res = Rx.Observable.create(function (observer) { } );
        * @param {Function} subscribe Implementation of the resulting observable sequence's subscribe method, returning a function that will be wrapped in a Disposable.
        * @returns {Observable} The observable sequence with the specified implementation for the Subscribe method.
        */
        create<T>(subscribe: (observer: Observer<T>) => IDisposable | Function | void): Observable<T>;
    }

    export interface ObservableStatic {
        /**
          *  Returns an observable sequence that invokes the specified factory function whenever a new observer subscribes.
          *
          * @example
          *  var res = Rx.Observable.defer(function () { return Rx.Observable.fromArray([1,2,3]); });
          * @param {Function} observableFactory Observable factory function to invoke for each observer that subscribes to the resulting sequence or Promise.
          * @returns {Observable} An observable sequence whose observers trigger an invocation of the given observable factory function.
          */
        defer<T>(observableFactory: () => (IObservable<T> | Observable<T> | Promise<T>)): Observable<T>;
    }

    export interface ObservableStatic {
        /**
  *  Returns an empty observable sequence, using the specified scheduler to send out the single OnCompleted message.
  *
  * @example
  *  var res = Rx.Observable.empty();
  *  var res = Rx.Observable.empty(Rx.Scheduler.timeout);
  * @param {Scheduler} [scheduler] Scheduler to send the termination call on.
  * @returns {Observable} An observable sequence with no elements.
  */
        empty<T>(scheduler?: IScheduler): Observable<T>;
    }

    export interface ObservableStatic {
        /**
         * This method creates a new Observable sequence from an array-like or iterable object.
         * @param {Any} arrayLike An array-like or iterable object to convert to an Observable sequence.
         * @param {Function} [mapFn] Map function to call on every element of the array.
         * @param {Any} [thisArg] The context to use calling the mapFn if provided.
         * @param {Scheduler} [scheduler] Optional scheduler to use for scheduling.  If not provided, defaults to Scheduler.currentThread.
         */
        from<T>(array: (Array<T> | { length: number;[index: number]: T; })): Observable<T>;
        /**
         * This method creates a new Observable sequence from an array-like or iterable object.
         * @param {Any} arrayLike An array-like or iterable object to convert to an Observable sequence.
         * @param {Function} [mapFn] Map function to call on every element of the array.
         * @param {Any} [thisArg] The context to use calling the mapFn if provided.
         * @param {Scheduler} [scheduler] Optional scheduler to use for scheduling.  If not provided, defaults to Scheduler.currentThread.
         */
        from<T, TResult>(array: (Array<T> | { length: number;[index: number]: T; }), mapFn: (value: T, index: number) => TResult, thisArg?: any, scheduler?: IScheduler): Observable<TResult>;
    }

    export interface ObservableStatic {
        /**
         *  Converts an array to an observable sequence, using an optional scheduler to enumerate the array.
         * @deprecated use Observable.from or Observable.of
         * @param {Scheduler} [scheduler] Scheduler to run the enumeration of the input sequence on.
         * @returns {Observable} The observable sequence whose elements are pulled from the given enumerable sequence.
         */
        fromArray<T>(array: (Array<T> | { length: number;[index: number]: T; }), scheduler?: IScheduler): Observable<T>;
    }

    export interface ObservableStatic {
        /**
        * Returns a non-terminating observable sequence, which can be used to denote an infinite duration (e.g. when using reactive joins).
        * @returns {Observable} An observable sequence whose observers will never get called.
        */
        never<T>(): Observable<T>;
    }

    export interface ObservableStatic {
        /**
        *  This method creates a new Observable instance with a variable number of arguments, regardless of number or type of the arguments.
        * @returns {Observable} The observable sequence whose elements are pulled from the given arguments.
        */
        of<T>(...values: T[]): Observable<T>;

        /**
        *  This method creates a new Observable instance with a variable number of arguments, regardless of number or type of the arguments.
        * @param {Scheduler} scheduler A scheduler to use for scheduling the arguments.
        * @returns {Observable} The observable sequence whose elements are pulled from the given arguments.
        */
        ofWithScheduler<T>(scheduler?: IScheduler, ...values: T[]): Observable<T>;
    }

    export interface ObservableStatic {
        /**
        * Convert an object into an observable sequence of [key, value] pairs.
        * @param {Object} obj The object to inspect.
        * @param {Scheduler} [scheduler] Scheduler to run the enumeration of the input sequence on.
        * @returns {Observable} An observable sequence of [key, value] pairs from the object.
        */
        pairs<T>(obj: { [key: string]: T }, scheduler?: IScheduler): Observable<[string, T]>;
        /**
        * Convert an object into an observable sequence of [key, value] pairs.
        * @param {Object} obj The object to inspect.
        * @param {Scheduler} [scheduler] Scheduler to run the enumeration of the input sequence on.
        * @returns {Observable} An observable sequence of [key, value] pairs from the object.
        */
        pairs<T>(obj: { [key: number]: T }, scheduler?: IScheduler): Observable<[number, T]>;
    }

    export interface ObservableStatic {
        /**
        *  Generates an observable sequence of integral numbers within a specified range, using the specified scheduler to send out observer messages.
        *
        * @example
        *  var res = Rx.Observable.range(0, 10);
        *  var res = Rx.Observable.range(0, 10, Rx.Scheduler.timeout);
        * @param {Number} start The value of the first integer in the sequence.
        * @param {Number} count The number of sequential integers to generate.
        * @param {Scheduler} [scheduler] Scheduler to run the generator loop on. If not specified, defaults to Scheduler.currentThread.
        * @returns {Observable} An observable sequence that contains a range of sequential integral numbers.
        */
        range(start: number, count: number, scheduler?: IScheduler): Observable<number>;
    }

    export interface ObservableStatic {
        /**
         *  Generates an observable sequence that repeats the given element the specified number of times, using the specified scheduler to send out observer messages.
         *
         * @example
         *  var res = Rx.Observable.repeat(42);
         *  var res = Rx.Observable.repeat(42, 4);
         *  3 - res = Rx.Observable.repeat(42, 4, Rx.Scheduler.timeout);
         *  4 - res = Rx.Observable.repeat(42, null, Rx.Scheduler.timeout);
         * @param {Mixed} value Element to repeat.
         * @param {Number} repeatCount [Optiona] Number of times to repeat the element. If not specified, repeats indefinitely.
         * @param {Scheduler} scheduler Scheduler to run the producer loop on. If not specified, defaults to Scheduler.immediate.
         * @returns {Observable} An observable sequence that repeats the given element the specified number of times.
         */
        repeat<T>(value: T, repeatCount?: number | void, scheduler?: IScheduler): Observable<T>;
    }

    export interface ObservableStatic {
        /**
        *  Returns an observable sequence that contains a single element, using the specified scheduler to send out observer messages.
        *  There is an alias called 'just' or browsers <IE9.
        * @param {Mixed} value Single element in the resulting observable sequence.
        * @param {Scheduler} scheduler Scheduler to send the single element on. If not specified, defaults to Scheduler.immediate.
        * @returns {Observable} An observable sequence containing the single specified element.
        */
        return<T>(value: T, scheduler?: IScheduler): Observable<T>;
        /**
        *  Returns an observable sequence that contains a single element, using the specified scheduler to send out observer messages.
        *  There is an alias called 'just' or browsers <IE9.
        * @param {Mixed} value Single element in the resulting observable sequence.
        * @param {Scheduler} scheduler Scheduler to send the single element on. If not specified, defaults to Scheduler.immediate.
        * @returns {Observable} An observable sequence containing the single specified element.
        */
        just<T>(value: T, scheduler?: IScheduler): Observable<T>;
    }

    export interface ObservableStatic {
        /**
        *  Returns an observable sequence that terminates with an exception, using the specified scheduler to send out the single onError message.
        * @param {Mixed} error An object used for the sequence's termination.
        * @param {Scheduler} scheduler Scheduler to send the exceptional termination call on. If not specified, defaults to Scheduler.immediate.
        * @returns {Observable} The observable sequence that terminates exceptionally with the specified exception object.
        */
        throw<T>(exception: Error, scheduler?: IScheduler): Observable<T>;
        /**
        *  Returns an observable sequence that terminates with an exception, using the specified scheduler to send out the single onError message.
        * @param {Mixed} error An object used for the sequence's termination.
        * @param {Scheduler} scheduler Scheduler to send the exceptional termination call on. If not specified, defaults to Scheduler.immediate.
        * @returns {Observable} The observable sequence that terminates exceptionally with the specified exception object.
        */
        throw<T>(exception: any, scheduler?: IScheduler): Observable<T>;
    }

    export interface Observable<T> {
        /**
        * Continues an observable sequence that is terminated by an exception with the next observable sequence.
        * @param {Mixed} handlerOrSecond Exception handler function that returns an observable sequence given the error that occurred in the first sequence, or a second observable sequence used to produce results when an error occurred in the first sequence.
        * @returns {Observable} An observable sequence containing the first sequence's elements, followed by the elements of the handler sequence in case an exception occurred.
        */
        catch(handler: (exception: any) => (IObservable<T> | Observable<T> | Promise<T>)): Observable<T>;
        /**
        * Continues an observable sequence that is terminated by an exception with the next observable sequence.
        * @param {Mixed} handlerOrSecond Exception handler function that returns an observable sequence given the error that occurred in the first sequence, or a second observable sequence used to produce results when an error occurred in the first sequence.
        * @returns {Observable} An observable sequence containing the first sequence's elements, followed by the elements of the handler sequence in case an exception occurred.
        */
        catch(second: (IObservable<T> | Observable<T> | Promise<T>)): Observable<T>;
    }

    export interface ObservableStatic {
        /**
        * Continues an observable sequence that is terminated by an exception with the next observable sequence.
        * @param {Array | Arguments} args Arguments or an array to use as the next sequence if an error occurs.
        * @returns {Observable} An observable sequence containing elements from consecutive source sequences until a source sequence terminates successfully.
        */
        catch<T>(sources: (IObservable<T> | Observable<T> | Promise<T>)[]): Observable<T>;
        /**
        * Continues an observable sequence that is terminated by an exception with the next observable sequence.
        * @param {Array | Arguments} args Arguments or an array to use as the next sequence if an error occurs.
        * @returns {Observable} An observable sequence containing elements from consecutive source sequences until a source sequence terminates successfully.
        */
        catch<T>(...sources: (IObservable<T> | Observable<T> | Promise<T>)[]): Observable<T>;
    }

    export interface Observable<T> {
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        * This can be in the form of an argument list of observables or an array.
        *
        * @example
        * 1 - obs = observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T2, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        * This can be in the form of an argument list of observables or an array.
        *
        * @example
        * 1 - obs = observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T2, T3, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        * This can be in the form of an argument list of observables or an array.
        *
        * @example
        * 1 - obs = observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T2, T3, T4, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        * This can be in the form of an argument list of observables or an array.
        *
        * @example
        * 1 - obs = observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T2, T3, T4, T5, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        * This can be in the form of an argument list of observables or an array.
        *
        * @example
        * 1 - obs = observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T2, T3, T4, T5, T6, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        * This can be in the form of an argument list of observables or an array.
        *
        * @example
        * 1 - obs = observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T2, T3, T4, T5, T6, T7, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), seventh: (IObservable<T7> | Observable<T7> | Promise<T7>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        * This can be in the form of an argument list of observables or an array.
        *
        * @example
        * 1 - obs = observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T2, T3, T4, T5, T6, T7, T8, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), seventh: (IObservable<T7> | Observable<T7> | Promise<T7>), eighth: (IObservable<T8> | Observable<T8> | Promise<T8>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        * This can be in the form of an argument list of observables or an array.
        *
        * @example
        * 1 - obs = observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T2, T3, T4, T5, T6, T7, T8, T9, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), seventh: (IObservable<T7> | Observable<T7> | Promise<T7>), eighth: (IObservable<T8> | Observable<T8> | Promise<T8>), ninth: (IObservable<T9> | Observable<T9> | Promise<T9>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        * This can be in the form of an argument list of observables or an array.
        *
        * @example
        * 1 - obs = observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<TOther, TResult>(souces: (IObservable<TOther> | Observable<TOther> | Promise<TOther>)[], resultSelector: (firstValue: T, ...otherValues: TOther[]) => TResult): Observable<TResult>;
    }

    export interface ObservableStatic {
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        *
        * @example
        * 1 - obs = Rx.Observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = Rx.Observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T, T2, TResult>(first: (IObservable<T> | Observable<T> | Promise<T>), second: (IObservable<T2> | Observable<T2> | Promise<T2>), resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        *
        * @example
        * 1 - obs = Rx.Observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = Rx.Observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T, T2, T3, TResult>(first: (IObservable<T> | Observable<T> | Promise<T>), second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        *
        * @example
        * 1 - obs = Rx.Observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = Rx.Observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T, T2, T3, T4, TResult>(first: (IObservable<T> | Observable<T> | Promise<T>), second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        *
        * @example
        * 1 - obs = Rx.Observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = Rx.Observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T, T2, T3, T4, T5, TResult>(first: (IObservable<T> | Observable<T> | Promise<T>), second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        *
        * @example
        * 1 - obs = Rx.Observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = Rx.Observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T, T2, T3, T4, T5, T6, TResult>(first: (IObservable<T> | Observable<T> | Promise<T>), second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        *
        * @example
        * 1 - obs = Rx.Observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = Rx.Observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T, T2, T3, T4, T5, T6, T7, TResult>(first: (IObservable<T> | Observable<T> | Promise<T>), second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), eventh: (IObservable<T7> | Observable<T7> | Promise<T7>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        *
        * @example
        * 1 - obs = Rx.Observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = Rx.Observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T, T2, T3, T4, T5, T6, T7, T8, TResult>(first: (IObservable<T> | Observable<T> | Promise<T>), second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), seventh: (IObservable<T7> | Observable<T7> | Promise<T7>), eighth: (IObservable<T8> | Observable<T8> | Promise<T8>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        *
        * @example
        * 1 - obs = Rx.Observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = Rx.Observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<T, T2, T3, T4, T5, T6, T7, T8, T9, TResult>(first: (IObservable<T> | Observable<T> | Promise<T>), second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), seventh: (IObservable<T7> | Observable<T7> | Promise<T7>), eighth: (IObservable<T8> | Observable<T8> | Promise<T8>), ninth: (IObservable<T9> | Observable<T9> | Promise<T9>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
        *
        * @example
        * 1 - obs = Rx.Observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
        * 2 - obs = Rx.Observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        combineLatest<TOther, TResult>(souces: (IObservable<TOther> | Observable<TOther> | Promise<TOther>)[], resultSelector: (...otherValues: TOther[]) => TResult): Observable<TResult>;
    }

    export interface Observable<T> {
        /**
        * Concatenates all the observable sequences.  This takes in either an array or variable arguments to concatenate.
        * @returns {Observable} An observable sequence that contains the elements of each given sequence, in sequential order.
        */
        concat(...sources: (IObservable<T> | Observable<T> | Promise<T>)[]): Observable<T>;
    }

    export interface ObservableStatic {
        /**
        * Concatenates all the observable sequences.
        * @param {Array | Arguments} args Arguments or an array to concat to the observable sequence.
        * @returns {Observable} An observable sequence that contains the elements of each given sequence, in sequential order.
        */
        concat<T>(...sources: (IObservable<T> | Observable<T> | Promise<T>)[]): Observable<T>;
        /**
        * Concatenates all the observable sequences.
        * @param {Array | Arguments} args Arguments or an array to concat to the observable sequence.
        * @returns {Observable} An observable sequence that contains the elements of each given sequence, in sequential order.
        */
        concat<T>(sources: (IObservable<T> | Observable<T> | Promise<T>)[]): Observable<T>;
    }

    export interface Observable<T> {
        /**
          * Concatenates an observable sequence of observable sequences.
          * @returns {Observable} An observable sequence that contains the elements of each observed inner sequence, in sequential order.
          */
        concatAll(): T;
    }

    export interface Observable<T> {
        /**
        * Merges an observable sequence of observable sequences into an observable sequence, limiting the number of concurrent subscriptions to inner sequences.
        * Or merges two observable sequences into a single observable sequence.
        *
        * @example
        * 1 - merged = sources.merge(1);
        * 2 - merged = source.merge(otherSource);
        * @param {Mixed} [maxConcurrentOrOther] Maximum number of inner observable sequences being subscribed to concurrently or the second observable sequence.
        * @returns {Observable} The observable sequence that merges the elements of the inner sequences.
        */
        merge(maxConcurrent: number): T;
        /**
        * Merges an observable sequence of observable sequences into an observable sequence, limiting the number of concurrent subscriptions to inner sequences.
        * Or merges two observable sequences into a single observable sequence.
        *
        * @example
        * 1 - merged = sources.merge(1);
        * 2 - merged = source.merge(otherSource);
        * @param {Mixed} [maxConcurrentOrOther] Maximum number of inner observable sequences being subscribed to concurrently or the second observable sequence.
        * @returns {Observable} The observable sequence that merges the elements of the inner sequences.
        */
        merge(other: (IObservable<T> | Observable<T> | Promise<T>)): Observable<T>;
    }

    export interface ObservableStatic {
        /**
        * Merges all the observable sequences into a single observable sequence.
        * The scheduler is optional and if not specified, the immediate scheduler is used.
        * @returns {Observable} The observable sequence that merges the elements of the observable sequences.
        */
        merge<T>(...sources: (IObservable<T> | Observable<T> | Promise<T>)[]): Observable<T>;
        /**
        * Merges all the observable sequences into a single observable sequence.
        * The scheduler is optional and if not specified, the immediate scheduler is used.
        * @returns {Observable} The observable sequence that merges the elements of the observable sequences.
        */
        merge<T>(sources: (IObservable<T> | Observable<T> | Promise<T>)[]): Observable<T>;
        /**
        * Merges all the observable sequences into a single observable sequence.
        * The scheduler is optional and if not specified, the immediate scheduler is used.
        * @returns {Observable} The observable sequence that merges the elements of the observable sequences.
        */
        merge<T>(scheduler: IScheduler, ...sources: (IObservable<T> | Observable<T> | Promise<T>)[]): Observable<T>;
        /**
        * Merges all the observable sequences into a single observable sequence.
        * The scheduler is optional and if not specified, the immediate scheduler is used.
        * @returns {Observable} The observable sequence that merges the elements of the observable sequences.
        */
        merge<T>(scheduler: IScheduler, sources: (IObservable<T> | Observable<T> | Promise<T>)[]): Observable<T>;
    }

    export interface ObservableStatic {
        /**
        * Flattens an Observable that emits Observables into one Observable, in a way that allows an Observer to
        * receive all successfully emitted items from all of the source Observables without being interrupted by
        * an error notification from one of them.
        *
        * This behaves like Observable.prototype.mergeAll except that if any of the merged Observables notify of an
        * error via the Observer's onError, mergeDelayError will refrain from propagating that
        * error notification until all of the merged Observables have finished emitting items.
        * @param {Array | Arguments} args Arguments or an array to merge.
        * @returns {Observable} an Observable that emits all of the items emitted by the Observables emitted by the Observable
        */
        mergeDelayError<T>(...sources: (IObservable<T> | Observable<T> | Promise<T>)[]): Observable<T>;
        /**
        * Flattens an Observable that emits Observables into one Observable, in a way that allows an Observer to
        * receive all successfully emitted items from all of the source Observables without being interrupted by
        * an error notification from one of them.
        *
        * This behaves like Observable.prototype.mergeAll except that if any of the merged Observables notify of an
        * error via the Observer's onError, mergeDelayError will refrain from propagating that
        * error notification until all of the merged Observables have finished emitting items.
        * @param {Array | Arguments} args Arguments or an array to merge.
        * @returns {Observable} an Observable that emits all of the items emitted by the Observables emitted by the Observable
        */
        mergeDelayError<T>(sources: (IObservable<T> | Observable<T> | Promise<T>)[]): Observable<T>;
    }

    export interface Observable<T> {
        /**
        * Merges an observable sequence of observable sequences into an observable sequence.
        * @returns {Observable} The observable sequence that merges the elements of the inner sequences.
        */
        mergeAll(): T;
    }

    export interface Observable<T> {
        /**
        * Returns the values from the source observable sequence only after the other observable sequence produces a value.
        * @param {Observable | Promise} other The observable sequence or Promise that triggers propagation of elements of the source sequence.
        * @returns {Observable} An observable sequence containing the elements of the source sequence starting from the point the other sequence triggered propagation.
        */
        skipUntil<T2>(other: (IObservable<T2> | Observable<T2> | Promise<T2>)): Observable<T>;
    }

    export interface Observable<T> {
        /**
        * Transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
        * @returns {Observable} The observable sequence that at any point in time produces the elements of the most recent inner observable sequence that has been received.
        */
        switch(): T;
        /**
        * Transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
        * @returns {Observable} The observable sequence that at any point in time produces the elements of the most recent inner observable sequence that has been received.
        */
        switchLatest(): T;
    }

    export interface Observable<T> {
        /**
        * Returns the values from the source observable sequence until the other observable sequence produces a value.
        * @param {Observable | Promise} other Observable sequence or Promise that terminates propagation of elements of the source sequence.
        * @returns {Observable} An observable sequence containing the elements of the source sequence up to the point the other sequence interrupted further propagation.
        */
        takeUntil<T2>(other: (IObservable<T2> | Observable<T2> | Promise<T2>)): Observable<T>;
    }

    export interface Observable<T> {
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function only when the (first) source observable sequence produces an element.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        withLatestFrom<T2, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function only when the (first) source observable sequence produces an element.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        withLatestFrom<T2, T3, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function only when the (first) source observable sequence produces an element.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        withLatestFrom<T2, T3, T4, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function only when the (first) source observable sequence produces an element.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        withLatestFrom<T2, T3, T4, T5, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function only when the (first) source observable sequence produces an element.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        withLatestFrom<T2, T3, T4, T5, T6, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function only when the (first) source observable sequence produces an element.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        withLatestFrom<T2, T3, T4, T5, T6, T7, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), seventh: (IObservable<T7> | Observable<T7> | Promise<T7>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function only when the (first) source observable sequence produces an element.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        withLatestFrom<T2, T3, T4, T5, T6, T7, T8, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), seventh: (IObservable<T7> | Observable<T7> | Promise<T7>), eighth: (IObservable<T8> | Observable<T8> | Promise<T8>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function only when the (first) source observable sequence produces an element.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        withLatestFrom<T2, T3, T4, T5, T6, T7, T8, T9, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), seventh: (IObservable<T7> | Observable<T7> | Promise<T7>), eighth: (IObservable<T8> | Observable<T8> | Promise<T8>), ninth: (IObservable<T9> | Observable<T9> | Promise<T9>), resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function only when the (first) source observable sequence produces an element.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        withLatestFrom<TOther, TResult>(souces: (IObservable<TOther> | Observable<TOther> | Promise<TOther>)[], resultSelector: (firstValue: T, ...otherValues: TOther[]) => TResult): Observable<TResult>;
    }

    export interface Observable<T> {
        /**
         * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
         * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
         * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
         */
        zip<T2, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), resultSelector?: (v1: T, v2: T2) => TResult): Observable<TResult>;
        /**
         * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
         * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
         * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
         */
        zip<T2, T3, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), resultSelector?: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        /**
         * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
         * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
         * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
         */
        zip<T2, T3, T4, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), resultSelector?: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        /**
         * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
         * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
         * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
         */
        zip<T2, T3, T4, T5, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), resultSelector?: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
        /**
         * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
         * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
         * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
         */
        zip<T2, T3, T4, T5, T6, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), resultSelector?: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult): Observable<TResult>;
        /**
         * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
         * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
         * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
         */
        zip<T2, T3, T4, T5, T6, T7, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), seventh: (IObservable<T7> | Observable<T7> | Promise<T7>), resultSelector?: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => TResult): Observable<TResult>;
        /**
         * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
         * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
         * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
         */
        zip<T2, T3, T4, T5, T6, T7, T8, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), seventh: (IObservable<T7> | Observable<T7> | Promise<T7>), eighth: (IObservable<T8> | Observable<T8> | Promise<T8>), resultSelector?: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => TResult): Observable<TResult>;
        /**
         * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
         * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
         * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
         */
        zip<T2, T3, T4, T5, T6, T7, T8, T9, TResult>(second: (IObservable<T2> | Observable<T2> | Promise<T2>), third: (IObservable<T3> | Observable<T3> | Promise<T3>), fourth: (IObservable<T4> | Observable<T4> | Promise<T4>), fifth: (IObservable<T5> | Observable<T5> | Promise<T5>), sixth: (IObservable<T6> | Observable<T6> | Promise<T6>), seventh: (IObservable<T7> | Observable<T7> | Promise<T7>), eighth: (IObservable<T8> | Observable<T8> | Promise<T8>), ninth: (IObservable<T9> | Observable<T9> | Promise<T9>), resultSelector?: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => TResult): Observable<TResult>;
        /**
         * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
         * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
         * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
         */
        zip<TOther, TResult>(souces: (IObservable<TOther> | Observable<TOther> | Promise<TOther>)[], resultSelector?: (firstValue: T, ...otherValues: TOther[]) => TResult): Observable<TResult>;
    }

    export interface ObservableStatic {
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences have produced an element at a corresponding index.
        * @param arguments Observable sources.
        * @param {Function} resultSelector Function to invoke for each series of elements at corresponding indexes in the sources.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        zip<T1, T2, TResult>(sources: (IObservable<T2> | Observable<T2> | Promise<T2>)[], resultSelector?: (item1: T1, ...right: T2[]) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences have produced an element at a corresponding index.
        * @param arguments Observable sources.
        * @param {Function} resultSelector Function to invoke for each series of elements at corresponding indexes in the sources.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        zip<T1, T2, TResult>(source1: (IObservable<T1> | Observable<T1> | Promise<T1>), ObservableOrPromise: Observable<T2>, resultSelector?: (item1: T1, item2: T2) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences have produced an element at a corresponding index.
        * @param arguments Observable sources.
        * @param {Function} resultSelector Function to invoke for each series of elements at corresponding indexes in the sources.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        zip<T1, T2, T3, TResult>(source1: (IObservable<T1> | Observable<T1> | Promise<T1>), source2: (IObservable<T2> | Observable<T2> | Promise<T2>), source3: (IObservable<T3> | Observable<T3> | Promise<T3>), resultSelector?: (item1: T1, item2: T2, item3: T3) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences have produced an element at a corresponding index.
        * @param arguments Observable sources.
        * @param {Function} resultSelector Function to invoke for each series of elements at corresponding indexes in the sources.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        zip<T1, T2, T3, T4, TResult>(source1: Observable<T1>, source2: (IObservable<T2> | Observable<T2> | Promise<T2>), source3: (IObservable<T3> | Observable<T3> | Promise<T3>), source4: (IObservable<T4> | Observable<T4> | Promise<T4>), resultSelector?: (item1: T1, item2: T2, item3: T3, item4: T4) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences have produced an element at a corresponding index.
        * @param arguments Observable sources.
        * @param {Function} resultSelector Function to invoke for each series of elements at corresponding indexes in the sources.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        zip<T1, T2, T3, T4, T5, TResult>(source1: (IObservable<T1> | Observable<T1> | Promise<T1>), source2: (IObservable<T2> | Observable<T2> | Promise<T2>), source3: (IObservable<T3> | Observable<T3> | Promise<T3>), source4: (IObservable<T4> | Observable<T4> | Promise<T4>), source5: (IObservable<T5> | Observable<T5> | Promise<T5>), resultSelector?: (item1: T1, item2: T2, item3: T3, item4: T4, item5: T5) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences have produced an element at a corresponding index.
        * @param arguments Observable sources.
        * @param {Function} resultSelector Function to invoke for each series of elements at corresponding indexes in the sources.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        zip<T1, T2, T3, T4, T5, T6, TResult>(source1: (IObservable<T1> | Observable<T1> | Promise<T1>), source2: (IObservable<T2> | Observable<T2> | Promise<T2>), source3: (IObservable<T3> | Observable<T3> | Promise<T3>), source4: (IObservable<T4> | Observable<T4> | Promise<T4>), source5: (IObservable<T5> | Observable<T5> | Promise<T5>), source6: (IObservable<T6> | Observable<T6> | Promise<T6>), resultSelector?: (item1: T1, item2: T2, item3: T3, item4: T4, item5: T5, item6: T6) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences have produced an element at a corresponding index.
        * @param arguments Observable sources.
        * @param {Function} resultSelector Function to invoke for each series of elements at corresponding indexes in the sources.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        zip<T1, T2, T3, T4, T5, T6, T7, TResult>(source1: (IObservable<T1> | Observable<T1> | Promise<T1>), source2: (IObservable<T2> | Observable<T2> | Promise<T2>), source3: (IObservable<T3> | Observable<T3> | Promise<T3>), source4: (IObservable<T4> | Observable<T4> | Promise<T4>), source5: (IObservable<T5> | Observable<T5> | Promise<T5>), source6: (IObservable<T6> | Observable<T6> | Promise<T6>), source7: (IObservable<T7> | Observable<T7> | Promise<T7>), resultSelector?: (item1: T1, item2: T2, item3: T3, item4: T4, item5: T5, item6: T6, item7: T7) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences have produced an element at a corresponding index.
        * @param arguments Observable sources.
        * @param {Function} resultSelector Function to invoke for each series of elements at corresponding indexes in the sources.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        zip<T1, T2, T3, T4, T5, T6, T7, T8, TResult>(source1: (IObservable<T1> | Observable<T1> | Promise<T1>), source2: (IObservable<T2> | Observable<T2> | Promise<T2>), source3: (IObservable<T3> | Observable<T3> | Promise<T3>), source4: (IObservable<T4> | Observable<T4> | Promise<T4>), source5: (IObservable<T5> | Observable<T5> | Promise<T5>), source6: (IObservable<T6> | Observable<T6> | Promise<T6>), source7: (IObservable<T7> | Observable<T7> | Promise<T7>), source8: (IObservable<T8> | Observable<T8> | Promise<T8>), resultSelector?: (item1: T1, item2: T2, item3: T3, item4: T4, item5: T5, item6: T6, item7: T7, item8: T8) => TResult): Observable<TResult>;
        /**
        * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences have produced an element at a corresponding index.
        * @param arguments Observable sources.
        * @param {Function} resultSelector Function to invoke for each series of elements at corresponding indexes in the sources.
        * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
        */
        zip<T1, T2, T3, T4, T5, T6, T7, T8, T9, TResult>(source1: (IObservable<T1> | Observable<T1> | Promise<T1>), source2: (IObservable<T2> | Observable<T2> | Promise<T2>), source3: (IObservable<T3> | Observable<T3> | Promise<T3>), source4: (IObservable<T4> | Observable<T4> | Promise<T4>), source5: (IObservable<T5> | Observable<T5> | Promise<T5>), source6: (IObservable<T6> | Observable<T6> | Promise<T6>), source7: (IObservable<T7> | Observable<T7> | Promise<T7>), source8: (IObservable<T8> | Observable<T8> | Promise<T8>), source9: (IObservable<T9> | Observable<T9> | Promise<T9>), resultSelector?: (item1: T1, item2: T2, item3: T3, item4: T4, item5: T5, item6: T6, item7: T7, item8: T8, item9: T9) => TResult): Observable<TResult>;
    }

    export interface Observable<T> {
        /**
       *  Hides the identity of an observable sequence.
       * @returns {Observable} An observable sequence that hides the identity of the source sequence.
       */
        asObservable(): Observable<T>;
    }

    export interface Observable<T> {
        /**
        * Dematerializes the explicit notification values of an observable sequence as implicit notifications.
        * @returns {Observable} An observable sequence exhibiting the behavior corresponding to the source sequence's notification values.
        */
        dematerialize<TOrigin>(): Observable<TOrigin>;
    }

    export interface Observable<T> {
        /**
        *  Returns an observable sequence that contains only distinct contiguous elements according to the keySelector and the comparer.
        *
        *  var obs = observable.distinctUntilChanged();
        *  var obs = observable.distinctUntilChanged(function (x) { return x.id; });
        *  var obs = observable.distinctUntilChanged(function (x) { return x.id; }, function (x, y) { return x === y; });
        *
        * @param {Function} [keySelector] A function to compute the comparison key for each element. If not provided, it projects the value.
        * @param {Function} [comparer] Equality comparer for computed key values. If not provided, defaults to an equality comparer function.
        * @returns {Observable} An observable sequence only containing the distinct contiguous elements, based on a computed key value, from the source sequence.
        */
        distinctUntilChanged<TValue>(keySelector?: (value: T) => TValue, comparer?: ((value1: TValue, value2: TValue) => boolean)): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  Invokes an action for each element in the observable sequence and invokes an action upon graceful or exceptional termination of the observable sequence.
        *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
        * @param {Function | Observer} observerOrOnNext Action to invoke for each element in the observable sequence or an observer.
        * @param {Function} [onError]  Action to invoke upon exceptional termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
        * @param {Function} [onCompleted]  Action to invoke upon graceful termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
        * @returns {Observable} The source sequence with the side-effecting behavior applied.
        */
        do(observer: Observer<T>): Observable<T>;
        /**
        *  Invokes an action for each element in the observable sequence and invokes an action upon graceful or exceptional termination of the observable sequence.
        *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
        * @param {Function | Observer} observerOrOnNext Action to invoke for each element in the observable sequence or an observer.
        * @param {Function} [onError]  Action to invoke upon exceptional termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
        * @param {Function} [onCompleted]  Action to invoke upon graceful termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
        * @returns {Observable} The source sequence with the side-effecting behavior applied.
        */
        tap(observer: Observer<T>): Observable<T>;

        /**
        *  Invokes an action for each element in the observable sequence and invokes an action upon graceful or exceptional termination of the observable sequence.
        *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
        * @param {Function | Observer} observerOrOnNext Action to invoke for each element in the observable sequence or an observer.
        * @param {Function} [onError]  Action to invoke upon exceptional termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
        * @param {Function} [onCompleted]  Action to invoke upon graceful termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
        * @returns {Observable} The source sequence with the side-effecting behavior applied.
        */
        do(onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void): Observable<T>;
        /**
        *  Invokes an action for each element in the observable sequence and invokes an action upon graceful or exceptional termination of the observable sequence.
        *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
        * @param {Function | Observer} observerOrOnNext Action to invoke for each element in the observable sequence or an observer.
        * @param {Function} [onError]  Action to invoke upon exceptional termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
        * @param {Function} [onCompleted]  Action to invoke upon graceful termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
        * @returns {Observable} The source sequence with the side-effecting behavior applied.
        */
        tap(onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void): Observable<T>;

        /**
        *  Invokes an action for each element in the observable sequence.
        *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
        * @param {Function} onNext Action to invoke for each element in the observable sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} The source sequence with the side-effecting behavior applied.
        */
        doOnNext(onNext: (value: T) => void, thisArg?: any): Observable<T>;
        /**
        *  Invokes an action upon exceptional termination of the observable sequence.
        *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
        * @param {Function} onError Action to invoke upon exceptional termination of the observable sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} The source sequence with the side-effecting behavior applied.
        */
        doOnError(onError: (exception: any) => void, thisArg?: any): Observable<T>;
        /**
        *  Invokes an action upon graceful termination of the observable sequence.
        *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
        * @param {Function} onCompleted Action to invoke upon graceful termination of the observable sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} The source sequence with the side-effecting behavior applied.
        */
        doOnCompleted(onCompleted: () => void, thisArg?: any): Observable<T>;

        /**
        *  Invokes an action for each element in the observable sequence.
        *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
        * @param {Function} onNext Action to invoke for each element in the observable sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} The source sequence with the side-effecting behavior applied.
        */
        tapOnNext(onNext: (value: T) => void, thisArg?: any): Observable<T>;
        /**
        *  Invokes an action upon exceptional termination of the observable sequence.
        *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
        * @param {Function} onError Action to invoke upon exceptional termination of the observable sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} The source sequence with the side-effecting behavior applied.
        */
        tapOnError(onError: (exception: any) => void, thisArg?: any): Observable<T>;
        /**
        *  Invokes an action upon graceful termination of the observable sequence.
        *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
        * @param {Function} onCompleted Action to invoke upon graceful termination of the observable sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} The source sequence with the side-effecting behavior applied.
        */
        tapOnCompleted(onCompleted: () => void, thisArg?: any): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  Invokes a specified action after the source observable sequence terminates gracefully or exceptionally.
        * @param {Function} finallyAction Action to invoke after the source observable sequence terminates.
        * @returns {Observable} Source sequence with the action-invoking termination behavior applied.
        */
        finally(action: () => void): Observable<T>;

        /**
        *  Invokes a specified action after the source observable sequence terminates gracefully or exceptionally.
        * @param {Function} finallyAction Action to invoke after the source observable sequence terminates.
        * @returns {Observable} Source sequence with the action-invoking termination behavior applied.
        */
        ensure(action: () => void): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  Ignores all elements in an observable sequence leaving only the termination messages.
        * @returns {Observable} An empty observable sequence that signals termination, successful or exceptional, of the source sequence.
        */
        ignoreElements(): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  Materializes the implicit notifications of an observable sequence as explicit notification values.
        * @returns {Observable} An observable sequence containing the materialized notification values from the source sequence.
        */
        materialize(): Observable<T>;
    }

    export interface Observable<T> {
        /**
         *  Repeats the observable sequence a specified number of times. If the repeat count is not specified, the sequence repeats indefinitely.
         * @param {Number} [repeatCount]  Number of times to repeat the sequence. If not provided, repeats the sequence indefinitely.
         * @returns {Observable} The observable sequence producing the elements of the given sequence repeatedly.
         */
        repeat(repeatCount?: number): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  Repeats the source observable sequence the specified number of times or until it successfully terminates. If the retry count is not specified, it retries indefinitely.
        *  Note if you encounter an error and want it to retry once, then you must use .retry(2);
        *
        * @example
        *  var res = retried = retry.repeat();
        *  var res = retried = retry.repeat(2);
        * @param {Number} [retryCount]  Number of times to retry the sequence. If not provided, retry the sequence indefinitely.
        * @returns {Observable} An observable sequence producing the elements of the given sequence repeatedly until it terminates successfully.
        */
        retry(retryCount?: number): Observable<T>;
    }

    export interface Observable<T> {
        /**
         *  Repeats the source observable sequence upon error each time the notifier emits or until it successfully terminates.
         *  if the notifier completes, the observable sequence completes.
         *
         * @example
         *  var timer = Observable.timer(500);
         *  var source = observable.retryWhen(timer);
         * @param {Observable} [notifier] An observable that triggers the retries or completes the observable with onNext or onCompleted respectively.
         * @returns {Observable} An observable sequence producing the elements of the given sequence repeatedly until it terminates successfully.
         */
        retryWhen(notifier: (errors: Observable<any>) => Observable<any>): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  Applies an accumulator function over an observable sequence and returns each intermediate result. The optional seed value is used as the initial accumulator value.
        *  For aggregation behavior with no intermediate results, see Observable.aggregate.
        * @example
        *  var res = source.scan(function (acc, x) { return acc + x; });
        *  var res = source.scan(function (acc, x) { return acc + x; }, 0);
        * @param {Function} accumulator An accumulator function to be invoked on each element.
        * @param {Mixed} [seed] The initial accumulator value.
        * @returns {Observable} An observable sequence containing the accumulated values.
        */
        scan<TAcc>(accumulator: ((acc: T, value: T) => TAcc), seed?: TAcc): Observable<TAcc>;
        /**
        *  Applies an accumulator function over an observable sequence and returns each intermediate result. The optional seed value is used as the initial accumulator value.
        *  For aggregation behavior with no intermediate results, see Observable.aggregate.
        * @example
        *  var res = source.scan(function (acc, x) { return acc + x; });
        *  var res = source.scan(function (acc, x) { return acc + x; }, 0);
        * @param {Function} accumulator An accumulator function to be invoked on each element.
        * @param {Mixed} [seed] The initial accumulator value.
        * @returns {Observable} An observable sequence containing the accumulated values.
        */
        scan(accumulator: ((acc: T, value: T) => T), seed?: T): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  Bypasses a specified number of elements at the end of an observable sequence.
        * @description
        *  This operator accumulates a queue with a length enough to store the first `count` elements. As more elements are
        *  received, elements are taken from the front of the queue and produced on the result sequence. This causes elements to be delayed.
        * @param count Number of elements to bypass at the end of the source sequence.
        * @returns {Observable} An observable sequence containing the source sequence elements except for the bypassed ones at the end.
        */
        skipLast(count: number): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  Prepends a sequence of values to an observable sequence with an optional scheduler and an argument list of values to prepend.
        *  @example
        *  var res = source.startWith(1, 2, 3);
        *  var res = source.startWith(Rx.Scheduler.timeout, 1, 2, 3);
        * @param {Arguments} args The specified values to prepend to the observable sequence
        * @returns {Observable} The source sequence prepended with the specified values.
        */
        startWith(...values: T[]): Observable<T>;
        /**
        *  Prepends a sequence of values to an observable sequence with an optional scheduler and an argument list of values to prepend.
        *  @example
        *  var res = source.startWith(1, 2, 3);
        *  var res = source.startWith(Rx.Scheduler.timeout, 1, 2, 3);
        * @param {Arguments} args The specified values to prepend to the observable sequence
        * @returns {Observable} The source sequence prepended with the specified values.
        */
        startWith(scheduler: IScheduler, ...values: T[]): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  Returns a specified number of contiguous elements from the end of an observable sequence.
        * @description
        *  This operator accumulates a buffer with a length enough to store elements count elements. Upon completion of
        *  the source sequence, this buffer is drained on the result sequence. This causes the elements to be delayed.
        * @param {Number} count Number of elements to take from the end of the source sequence.
        * @returns {Observable} An observable sequence containing the specified number of elements from the end of the source sequence.
        */
        takeLast(count: number): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.concatMap(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the
        * source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        concatMap<TResult>(selector: (IObservable<TResult> | Observable<TResult> | Promise<TResult>) | ((value: T, index: number, observable: (IObservable<T> | Observable<T> | Promise<T>)) => (IObservable<TResult> | Observable<TResult> | Promise<TResult>))): Observable<TResult>;
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.concatMap(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the
        * source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        concatMap<TResult>(selector: (Array<TResult> | { length: number;[index: number]: TResult; }) | ((value: T, index: number, observable: (Array<T> | { length: number;[index: number]: T; })) => (Array<TResult> | { length: number;[index: number]: TResult; }))): Observable<TResult>;
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.concatMap(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the
        * source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        concatMap<TOther, TResult>(selector: (IObservable<TOther> | Observable<TOther> | Promise<TOther>) | ((value: T, index: number, observable: (IObservable<T> | Observable<T> | Promise<T>)) => (IObservable<TOther> | Observable<TOther> | Promise<TOther>)), resultSelector: ((value: T, selectorValue: TOther, index: number, selectorOther: number) => TResult), thisArg?: any): Observable<TResult>;
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.concatMap(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the
        * source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        concatMap<TOther, TResult>(selector: (Array<TOther> | { length: number;[index: number]: TOther; }) | ((value: T, index: number, observable: (Array<T> | { length: number;[index: number]: T; })) => (Array<TOther> | { length: number;[index: number]: TOther; })), resultSelector: ((value: T, selectorValue: TOther, index: number, selectorOther: number) => TResult), thisArg?: any): Observable<TResult>;
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.concatMap(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the
        * source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        selectConcat<TResult>(selector: (IObservable<TResult> | Observable<TResult> | Promise<TResult>) | ((value: T, index: number, observable: (IObservable<T> | Observable<T> | Promise<T>)) => (IObservable<TResult> | Observable<TResult> | Promise<TResult>))): Observable<TResult>;
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.concatMap(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the
        * source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        selectConcat<TResult>(selector: (Array<TResult> | { length: number;[index: number]: TResult; }) | ((value: T, index: number, observable: (Array<T> | { length: number;[index: number]: T; })) => (Array<TResult> | { length: number;[index: number]: TResult; }))): Observable<TResult>;
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.concatMap(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the
        * source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        selectConcat<TOther, TResult>(selector: (IObservable<TOther> | Observable<TOther> | Promise<TOther>) | ((value: T, index: number, observable: (IObservable<T> | Observable<T> | Promise<T>)) => (IObservable<TOther> | Observable<TOther> | Promise<TOther>)), resultSelector: ((value: T, selectorValue: TOther, index: number, selectorOther: number) => TResult), thisArg?: any): Observable<TResult>;
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.concatMap(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the
        * source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        selectConcat<TOther, TResult>(selector: (Array<TOther> | { length: number;[index: number]: TOther; }) | ((value: T, index: number, observable: (Array<T> | { length: number;[index: number]: T; })) => (Array<TOther> | { length: number;[index: number]: TOther; })), resultSelector: ((value: T, selectorValue: TOther, index: number, selectorOther: number) => TResult), thisArg?: any): Observable<TResult>;
    }

    export interface Observable<T> {
        /**
        * Projects each element of an observable sequence into a new form by incorporating the element's index.
        * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source.
        */
        select<TResult>(selector: ((value: T, index: number, observable: Observable<T>) => TResult), thisArg?: any): Observable<TResult>;
        /**
        * Projects each element of an observable sequence into a new form by incorporating the element's index.
        * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source.
        */
        map<TResult>(selector: ((value: T, index: number, observable: Observable<T>) => TResult), thisArg?: any): Observable<TResult>;
    }

    export interface Observable<T> {
        /**
        * Retrieves the value of a specified nested property from all elements in
        * the Observable sequence.
        * @param {Arguments} arguments The nested properties to pluck.
        * @returns {Observable} Returns a new Observable sequence of property values.
        */
        pluck<TResult>(prop: string): Observable<TResult>;
    }


    export interface Observable<T> {
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.selectMany(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        flatMap<TResult>(selector: (IObservable<TResult> | Observable<TResult> | Promise<TResult>) | ((value: T, index: number, observable: (IObservable<T> | Observable<T> | Promise<T>)) => (IObservable<TResult> | Observable<TResult> | Promise<TResult>))): Observable<TResult>;
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.selectMany(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        flatMap<TResult>(selector: (Array<TResult> | { length: number;[index: number]: TResult; }) | ((value: T, index: number, observable: (Array<T> | { length: number;[index: number]: T; })) => (Array<TResult> | { length: number;[index: number]: TResult; }))): Observable<TResult>;
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.selectMany(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        flatMap<TOther, TResult>(selector: (IObservable<TOther> | Observable<TOther> | Promise<TOther>) | ((value: T, index: number, observable: (IObservable<T> | Observable<T> | Promise<T>)) => (IObservable<TOther> | Observable<TOther> | Promise<TOther>)), resultSelector: ((value: T, selectorValue: TOther, index: number, selectorOther: number) => TResult), thisArg?: any): Observable<TResult>;
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.selectMany(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        flatMap<TOther, TResult>(selector: (Array<TOther> | { length: number;[index: number]: TOther; }) | ((value: T, index: number, observable: (Array<T> | { length: number;[index: number]: T; })) => (Array<TOther> | { length: number;[index: number]: TOther; })), resultSelector: ((value: T, selectorValue: TOther, index: number, selectorOther: number) => TResult), thisArg?: any): Observable<TResult>;
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.selectMany(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        selectMany<TResult>(selector: (IObservable<TResult> | Observable<TResult> | Promise<TResult>) | ((value: T, index: number, observable: (IObservable<T> | Observable<T> | Promise<T>)) => (IObservable<TResult> | Observable<TResult> | Promise<TResult>))): Observable<TResult>;
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.selectMany(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        selectMany<TResult>(selector: (Array<TResult> | { length: number;[index: number]: TResult; }) | ((value: T, index: number, observable: (Array<T> | { length: number;[index: number]: T; })) => (Array<TResult> | { length: number;[index: number]: TResult; }))): Observable<TResult>;
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.selectMany(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        selectMany<TOther, TResult>(selector: (IObservable<TOther> | Observable<TOther> | Promise<TOther>) | ((value: T, index: number, observable: (IObservable<T> | Observable<T> | Promise<T>)) => (IObservable<TOther> | Observable<TOther> | Promise<TOther>)), resultSelector: ((value: T, selectorValue: TOther, index: number, selectorOther: number) => TResult), thisArg?: any): Observable<TResult>;
        /**
        *  One of the Following:
        *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        * @example
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); });
        *  Or:
        *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
        *
        *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
        *  Or:
        *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
        *
        *  var res = source.selectMany(Rx.Observable.fromArray([1,2,3]));
        * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the source sequence onto which could be either an observable or Promise.
        * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
        */
        selectMany<TOther, TResult>(selector: (Array<TOther> | { length: number;[index: number]: TOther; }) | ((value: T, index: number, observable: (Array<T> | { length: number;[index: number]: T; })) => (Array<TOther> | { length: number;[index: number]: TOther; })), resultSelector: ((value: T, selectorValue: TOther, index: number, selectorOther: number) => TResult), thisArg?: any): Observable<TResult>;
    }

    export interface Observable<T> {
        /**
        *  Projects each element of an observable sequence into a new sequence of observable sequences by incorporating the element's index and then
        *  transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
        * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source producing an Observable of Observable sequences
        *  and that at any point in time produces the elements of the most recent inner observable sequence that has been received.
        */
        selectSwitch<TResult>(selector: (IObservable<TResult> | Observable<TResult> | Promise<TResult>) | ((value: T, index: number, observable: (IObservable<T> | Observable<T> | Promise<T>)) => (IObservable<TResult> | Observable<TResult> | Promise<TResult>))): Observable<TResult>;
        /**
        *  Projects each element of an observable sequence into a new sequence of observable sequences by incorporating the element's index and then
        *  transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
        * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source producing an Observable of Observable sequences
        *  and that at any point in time produces the elements of the most recent inner observable sequence that has been received.
        */
        selectSwitch<TResult>(selector: (Array<TResult> | { length: number;[index: number]: TResult; }) | ((value: T, index: number, observable: (Array<T> | { length: number;[index: number]: T; })) => (Array<TResult> | { length: number;[index: number]: TResult; }))): Observable<TResult>;
        /**
        *  Projects each element of an observable sequence into a new sequence of observable sequences by incorporating the element's index and then
        *  transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
        * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source producing an Observable of Observable sequences
        *  and that at any point in time produces the elements of the most recent inner observable sequence that has been received.
        */
        selectSwitch<TOther, TResult>(selector: (IObservable<TOther> | Observable<TOther> | Promise<TOther>) | ((value: T, index: number, observable: (IObservable<T> | Observable<T> | Promise<T>)) => (IObservable<TOther> | Observable<TOther> | Promise<TOther>)), resultSelector: ((value: T, selectorValue: TOther, index: number, selectorOther: number) => TResult), thisArg?: any): Observable<TResult>;
        /**
        *  Projects each element of an observable sequence into a new sequence of observable sequences by incorporating the element's index and then
        *  transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
        * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source producing an Observable of Observable sequences
        *  and that at any point in time produces the elements of the most recent inner observable sequence that has been received.
        */
        selectSwitch<TOther, TResult>(selector: (Array<TOther> | { length: number;[index: number]: TOther; }) | ((value: T, index: number, observable: (Array<T> | { length: number;[index: number]: T; })) => (Array<TOther> | { length: number;[index: number]: TOther; })), resultSelector: ((value: T, selectorValue: TOther, index: number, selectorOther: number) => TResult), thisArg?: any): Observable<TResult>;
        /**
        *  Projects each element of an observable sequence into a new sequence of observable sequences by incorporating the element's index and then
        *  transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
        * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source producing an Observable of Observable sequences
        *  and that at any point in time produces the elements of the most recent inner observable sequence that has been received.
        */
        flatMapLatest<TResult>(selector: (IObservable<TResult> | Observable<TResult> | Promise<TResult>) | ((value: T, index: number, observable: (IObservable<T> | Observable<T> | Promise<T>)) => (IObservable<TResult> | Observable<TResult> | Promise<TResult>))): Observable<TResult>;
        /**
        *  Projects each element of an observable sequence into a new sequence of observable sequences by incorporating the element's index and then
        *  transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
        * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source producing an Observable of Observable sequences
        *  and that at any point in time produces the elements of the most recent inner observable sequence that has been received.
        */
        flatMapLatest<TResult>(selector: (Array<TResult> | { length: number;[index: number]: TResult; }) | ((value: T, index: number, observable: (Array<T> | { length: number;[index: number]: T; })) => (Array<TResult> | { length: number;[index: number]: TResult; }))): Observable<TResult>;
        /**
        *  Projects each element of an observable sequence into a new sequence of observable sequences by incorporating the element's index and then
        *  transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
        * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source producing an Observable of Observable sequences
        *  and that at any point in time produces the elements of the most recent inner observable sequence that has been received.
        */
        flatMapLatest<TOther, TResult>(selector: (IObservable<TOther> | Observable<TOther> | Promise<TOther>) | ((value: T, index: number, observable: (IObservable<T> | Observable<T> | Promise<T>)) => (IObservable<TOther> | Observable<TOther> | Promise<TOther>)), resultSelector: ((value: T, selectorValue: TOther, index: number, selectorOther: number) => TResult), thisArg?: any): Observable<TResult>;
        /**
        *  Projects each element of an observable sequence into a new sequence of observable sequences by incorporating the element's index and then
        *  transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
        * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source producing an Observable of Observable sequences
        *  and that at any point in time produces the elements of the most recent inner observable sequence that has been received.
        */
        flatMapLatest<TOther, TResult>(selector: (Array<TOther> | { length: number;[index: number]: TOther; }) | ((value: T, index: number, observable: (Array<T> | { length: number;[index: number]: T; })) => (Array<TOther> | { length: number;[index: number]: TOther; })), resultSelector: ((value: T, selectorValue: TOther, index: number, selectorOther: number) => TResult), thisArg?: any): Observable<TResult>;
    }

    export interface Observable<T> {
        /**
        * Bypasses a specified number of elements in an observable sequence and then returns the remaining elements.
        * @param {Number} count The number of elements to skip before returning the remaining elements.
        * @returns {Observable} An observable sequence that contains the elements that occur after the specified index in the input sequence.
        */
        skip(count: number): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  Bypasses elements in an observable sequence as long as a specified condition is true and then returns the remaining elements.
        *  The element's index is used in the logic of the predicate function.
        *
        *  var res = source.skipWhile(function (value) { return value < 10; });
        *  var res = source.skipWhile(function (value, index) { return value < 10 || index < 10; });
        * @param {Function} predicate A function to test each element for a condition; the second parameter of the function represents the index of the source element.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence that contains the elements from the input sequence starting at the first element in the linear series that does not pass the test specified by predicate.
        */
        skipWhile(predicate: ((value: T, index: number, observable: Observable<T>) => boolean), thisArg?: any): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  Returns a specified number of contiguous elements from the start of an observable sequence, using the specified scheduler for the edge case of take(0).
        *
        *  var res = source.take(5);
        *  var res = source.take(0, Rx.Scheduler.timeout);
        * @param {Number} count The number of elements to return.
        * @param {Scheduler} [scheduler] Scheduler used to produce an OnCompleted message in case <paramref name="count count</paramref> is set to 0.
        * @returns {Observable} An observable sequence that contains the specified number of elements from the start of the input sequence.
        */
        take(count: number, scheduler?: IScheduler): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  Returns elements from an observable sequence as long as a specified condition is true.
        *  The element's index is used in the logic of the predicate function.
        * @param {Function} predicate A function to test each element for a condition; the second parameter of the function represents the index of the source element.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence that contains the elements from the input sequence that occur before the element at which the test no longer passes.
        */
        takeWhile(predicate: ((value: T, index: number, observable: Observable<T>) => boolean), thisArg?: any): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  Filters the elements of an observable sequence based on a predicate by incorporating the element's index.
        *
        * @example
        *  var res = source.where(function (value) { return value < 10; });
        *  var res = source.where(function (value, index) { return value < 10 || index < 10; });
        * @param {Function} predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence that contains elements from the input sequence that satisfy the condition.
        */
        where(predicate: ((value: T, index: number, observable: Observable<T>) => boolean), thisArg?: any): Observable<T>;
        /**
        *  Filters the elements of an observable sequence based on a predicate by incorporating the element's index.
        *
        * @example
        *  var res = source.where(function (value) { return value < 10; });
        *  var res = source.where(function (value, index) { return value < 10 || index < 10; });
        * @param {Function} predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
        * @param {Any} [thisArg] Object to use as this when executing callback.
        * @returns {Observable} An observable sequence that contains elements from the input sequence that satisfy the condition.
        */
        filter(predicate: ((value: T, index: number, observable: Observable<T>) => boolean), thisArg?: any): Observable<T>;
    }

    export interface ObservableStatic {
        /**
         * Converts a callback function to an observable sequence.
         *
         * @param {Function} function Function with a callback as the last parameter to convert to an Observable sequence.
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback to produce a single item to yield on next.
         * @returns {Function} A function, when executed with the required parameters minus the callback, produces an Observable sequence with a single value of the arguments to the callback as an array.
         */
        fromCallback<TResult>(func: Function, context: any, selector: Function): (...args: any[]) => Observable<TResult>;
        /**
         * Converts a callback function to an observable sequence.
         *
         * @param {Function} function Function with a callback as the last parameter to convert to an Observable sequence.
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback to produce a single item to yield on next.
         * @returns {Function} A function, when executed with the required parameters minus the callback, produces an Observable sequence with a single value of the arguments to the callback as an array.
         */
        fromCallback<TResult, T1>(func: (arg1: T1, callback: (result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1) => Observable<TResult>;
        /**
         * Converts a callback function to an observable sequence.
         *
         * @param {Function} function Function with a callback as the last parameter to convert to an Observable sequence.
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback to produce a single item to yield on next.
         * @returns {Function} A function, when executed with the required parameters minus the callback, produces an Observable sequence with a single value of the arguments to the callback as an array.
         */
        fromCallback<TResult, T1, T2>(func: (arg1: T1, arg2: T2, callback: (result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2) => Observable<TResult>;
        /**
         * Converts a callback function to an observable sequence.
         *
         * @param {Function} function Function with a callback as the last parameter to convert to an Observable sequence.
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback to produce a single item to yield on next.
         * @returns {Function} A function, when executed with the required parameters minus the callback, produces an Observable sequence with a single value of the arguments to the callback as an array.
         */
        fromCallback<TResult, T1, T2, T3>(func: (arg1: T1, arg2: T2, arg3: T3, callback: (result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2, arg3: T3) => Observable<TResult>;
        /**
         * Converts a callback function to an observable sequence.
         *
         * @param {Function} function Function with a callback as the last parameter to convert to an Observable sequence.
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback to produce a single item to yield on next.
         * @returns {Function} A function, when executed with the required parameters minus the callback, produces an Observable sequence with a single value of the arguments to the callback as an array.
         */
        fromCallback<TResult, T1, T2, T3, T4>(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback: (result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Observable<TResult>;
        /**
         * Converts a callback function to an observable sequence.
         *
         * @param {Function} function Function with a callback as the last parameter to convert to an Observable sequence.
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback to produce a single item to yield on next.
         * @returns {Function} A function, when executed with the required parameters minus the callback, produces an Observable sequence with a single value of the arguments to the callback as an array.
         */
        fromCallback<TResult, T1, T2, T3, T4, T5>(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, callback: (result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Observable<TResult>;
        /**
         * Converts a callback function to an observable sequence.
         *
         * @param {Function} function Function with a callback as the last parameter to convert to an Observable sequence.
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback to produce a single item to yield on next.
         * @returns {Function} A function, when executed with the required parameters minus the callback, produces an Observable sequence with a single value of the arguments to the callback as an array.
         */
        fromCallback<TResult, T1, T2, T3, T4, T5, T6>(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, callback: (result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => Observable<TResult>;
        /**
         * Converts a callback function to an observable sequence.
         *
         * @param {Function} function Function with a callback as the last parameter to convert to an Observable sequence.
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback to produce a single item to yield on next.
         * @returns {Function} A function, when executed with the required parameters minus the callback, produces an Observable sequence with a single value of the arguments to the callback as an array.
         */
        fromCallback<TResult, T1, T2, T3, T4, T5, T6, T7>(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, callback: (result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => Observable<TResult>;
        /**
         * Converts a callback function to an observable sequence.
         *
         * @param {Function} function Function with a callback as the last parameter to convert to an Observable sequence.
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback to produce a single item to yield on next.
         * @returns {Function} A function, when executed with the required parameters minus the callback, produces an Observable sequence with a single value of the arguments to the callback as an array.
         */
        fromCallback<TResult, T1, T2, T3, T4, T5, T6, T7, T8>(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, callback: (result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => Observable<TResult>;
        /**
         * Converts a callback function to an observable sequence.
         *
         * @param {Function} function Function with a callback as the last parameter to convert to an Observable sequence.
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback to produce a single item to yield on next.
         * @returns {Function} A function, when executed with the required parameters minus the callback, produces an Observable sequence with a single value of the arguments to the callback as an array.
         */
        fromCallback<TResult, T1, T2, T3, T4, T5, T6, T7, T8, T9>(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, callback: (result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9) => Observable<TResult>;
    }

    export interface ObservableStatic {
        /**
         * Converts a Node.js callback style function to an observable sequence.  This must be in function (err, ...) format.
         * @param {Function} func The function to call
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback minus the error to produce a single item to yield on next.
         * @returns {Function} An async function which when applied, returns an observable sequence with the callback arguments as an array.
         */
        fromNodeCallback<TResult>(func: Function, context: any, selector: Function): (...args: any[]) => Observable<TResult>;
        /**
         * Converts a Node.js callback style function to an observable sequence.  This must be in function (err, ...) format.
         * @param {Function} func The function to call
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback minus the error to produce a single item to yield on next.
         * @returns {Function} An async function which when applied, returns an observable sequence with the callback arguments as an array.
         */
        fromNodeCallback<TResult, T1>(func: (arg1: T1, callback: (err: any, result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1) => Observable<TResult>;
        /**
         * Converts a Node.js callback style function to an observable sequence.  This must be in function (err, ...) format.
         * @param {Function} func The function to call
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback minus the error to produce a single item to yield on next.
         * @returns {Function} An async function which when applied, returns an observable sequence with the callback arguments as an array.
         */
        fromNodeCallback<TResult, T1, T2>(func: (arg1: T1, arg2: T2, callback: (err: any, result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2) => Observable<TResult>;
        /**
         * Converts a Node.js callback style function to an observable sequence.  This must be in function (err, ...) format.
         * @param {Function} func The function to call
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback minus the error to produce a single item to yield on next.
         * @returns {Function} An async function which when applied, returns an observable sequence with the callback arguments as an array.
         */
        fromNodeCallback<TResult, T1, T2, T3>(func: (arg1: T1, arg2: T2, arg3: T3, callback: (err: any, result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2, arg3: T3) => Observable<TResult>;
        /**
         * Converts a Node.js callback style function to an observable sequence.  This must be in function (err, ...) format.
         * @param {Function} func The function to call
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback minus the error to produce a single item to yield on next.
         * @returns {Function} An async function which when applied, returns an observable sequence with the callback arguments as an array.
         */
        fromNodeCallback<TResult, T1, T2, T3, T4>(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback: (err: any, result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Observable<TResult>;
        /**
         * Converts a Node.js callback style function to an observable sequence.  This must be in function (err, ...) format.
         * @param {Function} func The function to call
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback minus the error to produce a single item to yield on next.
         * @returns {Function} An async function which when applied, returns an observable sequence with the callback arguments as an array.
         */
        fromNodeCallback<TResult, T1, T2, T3, T4, T5>(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, callback: (err: any, result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Observable<TResult>;
        /**
         * Converts a Node.js callback style function to an observable sequence.  This must be in function (err, ...) format.
         * @param {Function} func The function to call
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback minus the error to produce a single item to yield on next.
         * @returns {Function} An async function which when applied, returns an observable sequence with the callback arguments as an array.
         */
        fromNodeCallback<TResult, T1, T2, T3, T4, T5, T6>(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, callback: (err: any, result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => Observable<TResult>;
        /**
         * Converts a Node.js callback style function to an observable sequence.  This must be in function (err, ...) format.
         * @param {Function} func The function to call
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback minus the error to produce a single item to yield on next.
         * @returns {Function} An async function which when applied, returns an observable sequence with the callback arguments as an array.
         */
        fromNodeCallback<TResult, T1, T2, T3, T4, T5, T6, T7>(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, callback: (err: any, result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => Observable<TResult>;
        /**
         * Converts a Node.js callback style function to an observable sequence.  This must be in function (err, ...) format.
         * @param {Function} func The function to call
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback minus the error to produce a single item to yield on next.
         * @returns {Function} An async function which when applied, returns an observable sequence with the callback arguments as an array.
         */
        fromNodeCallback<TResult, T1, T2, T3, T4, T5, T6, T7, T8>(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, callback: (err: any, result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => Observable<TResult>;
        /**
         * Converts a Node.js callback style function to an observable sequence.  This must be in function (err, ...) format.
         * @param {Function} func The function to call
         * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
         * @param {Function} [selector] A selector which takes the arguments from the callback minus the error to produce a single item to yield on next.
         * @returns {Function} An async function which when applied, returns an observable sequence with the callback arguments as an array.
         */
        fromNodeCallback<TResult, T1, T2, T3, T4, T5, T6, T7, T8, T9>(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, callback: (err: any, result: TResult) => any) => any, context?: any, selector?: Function): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9) => Observable<TResult>;
    }

    export interface ObservableStatic {
        /**
         * Creates an observable sequence by adding an event listener to the matching DOMElement or each item in the NodeList.
         * @param {Object} element The DOMElement or NodeList to attach a listener.
         * @param {String} eventName The event name to attach the observable sequence.
         * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
         * @returns {Observable} An observable sequence of events from the specified element and the specified event.
         */
        fromEvent<T>(element: NodeList, eventName: string, selector?: (arguments: any[]) => T): Observable<T>;
        /**
         * Creates an observable sequence by adding an event listener to the matching DOMElement or each item in the NodeList.
         * @param {Object} element The DOMElement or NodeList to attach a listener.
         * @param {String} eventName The event name to attach the observable sequence.
         * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
         * @returns {Observable} An observable sequence of events from the specified element and the specified event.
         */
        fromEvent<T>(element: Node, eventName: string, selector?: (arguments: any[]) => T): Observable<T>;
        /**
         * Creates an observable sequence by adding an event listener to the matching DOMElement or each item in the NodeList.
         * @param {Object} element The DOMElement or NodeList to attach a listener.
         * @param {String} eventName The event name to attach the observable sequence.
         * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
         * @returns {Observable} An observable sequence of events from the specified element and the specified event.
         */
        fromEvent<T>(element: { on: (name: string, cb: (e: any) => any) => void; off: (name: string, cb: (e: any) => any) => void }, eventName: string, selector?: (arguments: any[]) => T): Observable<T>;
    }

    export interface ObservableStatic {
        /**
        * Creates an observable sequence from an event emitter via an addHandler/removeHandler pair.
        * @param {Function} addHandler The function to add a handler to the emitter.
        * @param {Function} [removeHandler] The optional function to remove a handler from an emitter.
        * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
        * @returns {Observable} An observable sequence which wraps an event from an event emitter
        */
        fromEventPattern<T>(addHandler: (handler: Function) => void, removeHandler: (handler: Function) => void, selector?: (arguments: any[]) => T): Observable<T>;
    }

    export interface ObservableStatic {
        /**
        * Converts a Promise to an Observable sequence
        * @param {Promise} An ES6 Compliant promise.
        * @returns {Observable} An Observable sequence which wraps the existing promise success and failure.
        */
 		fromPromise<T>(promise: Promise<T>): Observable<T>;
    }

    export interface Observable<T> {
        /*
         * Converts an existing observable sequence to an ES6 Compatible Promise
         * @example
         * var promise = Rx.Observable.return(42).toPromise(RSVP.Promise);
         *
         * // With config
         * Rx.config.Promise = RSVP.Promise;
         * var promise = Rx.Observable.return(42).toPromise();
         * @param {Function} [promiseCtor] The constructor of the promise. If not provided, it looks for it in Rx.config.Promise.
         * @returns {Promise} An ES6 compatible promise with the last value from the observable sequence.
         */
        toPromise(promiseCtor?: { new (resolver: (resolvePromise: (value: T) => void, rejectPromise: (reason: any) => void) => void): IPromise<T>; }): IPromise<T>;
        /*
         * Converts an existing observable sequence to an ES6 Compatible Promise
         * @example
         * var promise = Rx.Observable.return(42).toPromise(RSVP.Promise);
         *
         * // With config
         * Rx.config.Promise = RSVP.Promise;
         * var promise = Rx.Observable.return(42).toPromise();
         * @param {Function} [promiseCtor] The constructor of the promise. If not provided, it looks for it in Rx.config.Promise.
         * @returns {Promise} An ES6 compatible promise with the last value from the observable sequence.
         */
        toPromise<TPromise extends IPromise<T>>(promiseCtor: { new (resolver: (resolvePromise: (value: T) => void, rejectPromise: (reason: any) => void) => void): TPromise; }): TPromise;
    }

    export interface ObservableStatic {
        /**
        * Invokes the asynchronous function, surfacing the result through an observable sequence.
        * @param {Function} functionAsync Asynchronous function which returns a Promise to run.
        * @returns {Observable} An observable sequence exposing the function's result value, or an exception.
        */
        startAsync<T>(functionAsync: () => IPromise<T>): Observable<T>;
    }

    /**
     *  Represents an object that is both an observable sequence as well as an observer.
     *  Each notification is broadcasted to all subscribed observers.
     */
    export interface ISubject<T> extends IObservable<T>, IObserver<T>, IDisposable {
        hasObservers(): boolean;
    }

    export interface Subject<T> extends Observable<T>, Observer<T>, IDisposable {
        hasObservers(): boolean;
        /** Is this value disposed. */
        isDisposed: boolean;
    }

    interface SubjectStatic {
        /**
         * Creates a subject.
         */
        new <T>(): Subject<T>;

        /**
         * Creates a subject from the specified observer and observable.
         * @param {Observer} observer The observer used to send messages to the subject.
         * @param {Observable} observable The observable used to subscribe to messages sent from the subject.
         * @returns {Subject} Subject implemented using the given observer and observable.
         */
        create<T>(observer?: IObserver<T>, observable?: IObservable<T>): Subject<T>;
    }

    /**
     *  Represents an object that is both an observable sequence as well as an observer.
     *  Each notification is broadcasted to all subscribed observers.
     */
    export var Subject: SubjectStatic;

        export interface ConnectableObservable<T> extends Observable<T> {
    		connect(): IDisposable;
    		refCount(): Observable<T>;
        }

    export interface Observable<T> {
        /**
        * Multicasts the source sequence notifications through an instantiated subject into all uses of the sequence within a selector function. Each
        * subscription to the resulting sequence causes a separate multicast invocation, exposing the sequence resulting from the selector function's
        * invocation. For specializations with fixed subject types, see Publish, PublishLast, and Replay.
        *
        * @example
        * 1 - res = source.multicast(observable);
        * 2 - res = source.multicast(function () { return new Subject(); }, function (x) { return x; });
        *
        * @param {Function|Subject} subjectOrSubjectSelector
        * Factory function to create an intermediate subject through which the source sequence's elements will be multicast to the selector function.
        * Or:
        * Subject to push source elements into.
        *
        * @param {Function} [selector] Optional selector function which can use the multicasted source sequence subject to the policies enforced by the created subject. Specified only if <paramref name="subjectOrSubjectSelector" is a factory function.
        * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
        */
        multicast(subject: ISubject<T> | (() => ISubject<T>)): ConnectableObservable<T>;
        /**
        * Multicasts the source sequence notifications through an instantiated subject into all uses of the sequence within a selector function. Each
        * subscription to the resulting sequence causes a separate multicast invocation, exposing the sequence resulting from the selector function's
        * invocation. For specializations with fixed subject types, see Publish, PublishLast, and Replay.
        *
        * @example
        * 1 - res = source.multicast(observable);
        * 2 - res = source.multicast(function () { return new Subject(); }, function (x) { return x; });
        *
        * @param {Function|Subject} subjectOrSubjectSelector
        * Factory function to create an intermediate subject through which the source sequence's elements will be multicast to the selector function.
        * Or:
        * Subject to push source elements into.
        *
        * @param {Function} [selector] Optional selector function which can use the multicasted source sequence subject to the policies enforced by the created subject. Specified only if <paramref name="subjectOrSubjectSelector" is a factory function.
        * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
        */
        multicast<TResult>(subjectSelector: ISubject<T> | (() => ISubject<T>), selector: (source: ConnectableObservable<T>) => Observable<T>): Observable<T>;
    }

    export interface Observable<T> {
        /**
        * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence.
        * This operator is a specialization of Multicast using a regular Subject.
        *
        * @example
        * var resres = source.publish();
        * var res = source.publish(function (x) { return x; });
        *
        * @param {Function} [selector] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive all notifications of the source from the time of the subscription on.
        * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
        */
        publish(): ConnectableObservable<T>;
        /**
        * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence.
        * This operator is a specialization of Multicast using a regular Subject.
        *
        * @example
        * var resres = source.publish();
        * var res = source.publish(function (x) { return x; });
        *
        * @param {Function} [selector] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive all notifications of the source from the time of the subscription on.
        * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
        */
        publish<TResult>(selector: (source: ConnectableObservable<T>) => Observable<TResult>): Observable<TResult>;
    }

    export interface Observable<T> {
        /**
        * Returns an observable sequence that shares a single subscription to the underlying sequence.
        * This operator is a specialization of publish which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
        * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
        */
        share(): Observable<T>;
    }

    export interface Observable<T> {
        /**
        * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence containing only the last notification.
        * This operator is a specialization of Multicast using a AsyncSubject.
        *
        * @example
        * var res = source.publishLast();
        * var res = source.publishLast(function (x) { return x; });
        *
        * @param selector [Optional] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will only receive the last notification of the source.
        * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
        */
        publishLast(): ConnectableObservable<T>;
        /**
        * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence containing only the last notification.
        * This operator is a specialization of Multicast using a AsyncSubject.
        *
        * @example
        * var res = source.publishLast();
        * var res = source.publishLast(function (x) { return x; });
        *
        * @param selector [Optional] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will only receive the last notification of the source.
        * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
        */
        publishLast<TResult>(selector: (source: ConnectableObservable<T>) => Observable<TResult>): Observable<TResult>;
    }

    export interface Observable<T> {
        /**
        * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence and starts with initialValue.
        * This operator is a specialization of Multicast using a BehaviorSubject.
        *
        * @example
        * var res = source.publishValue(42);
        * var res = source.publishValue(function (x) { return x.select(function (y) { return y * y; }) }, 42);
        *
        * @param {Function} [selector] Optional selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive immediately receive the initial value, followed by all notifications of the source from the time of the subscription on.
        * @param {Mixed} initialValue Initial value received by observers upon subscription.
        * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
        */
        publishValue(initialValue: T): ConnectableObservable<T>;
        /**
        * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence and starts with initialValue.
        * This operator is a specialization of Multicast using a BehaviorSubject.
        *
        * @example
        * var res = source.publishValue(42);
        * var res = source.publishValue(function (x) { return x.select(function (y) { return y * y; }) }, 42);
        *
        * @param {Function} [selector] Optional selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive immediately receive the initial value, followed by all notifications of the source from the time of the subscription on.
        * @param {Mixed} initialValue Initial value received by observers upon subscription.
        * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
        */
        publishValue<TResult>(selector: (source: ConnectableObservable<T>) => Observable<TResult>, initialValue: T): Observable<TResult>;
    }

    export interface Observable<T> {
        /**
        * Returns an observable sequence that shares a single subscription to the underlying sequence and starts with an initialValue.
        * This operator is a specialization of publishValue which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
        * @param {Mixed} initialValue Initial value received by observers upon subscription.
        * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
        */
        shareValue(initialValue: T): Observable<T>;
    }

    export interface Observable<T> {
        /**
        * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence replaying notifications subject to a maximum time length for the replay buffer.
        * This operator is a specialization of Multicast using a ReplaySubject.
        *
        * @example
        * var res = source.replay(null, 3);
        * var res = source.replay(null, 3, 500);
        * var res = source.replay(null, 3, 500, scheduler);
        * var res = source.replay(function (x) { return x.take(6).repeat(); }, 3, 500, scheduler);
        *
        * @param selector [Optional] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive all the notifications of the source subject to the specified replay buffer trimming policy.
        * @param bufferSize [Optional] Maximum element count of the replay buffer.
        * @param windowSize [Optional] Maximum time length of the replay buffer.
        * @param scheduler [Optional] Scheduler where connected observers within the selector function will be invoked on.
        * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
        */
        replay(selector?: void, bufferSize?: number, window?: number, scheduler?: IScheduler): ConnectableObservable<T>;	// hack to catch first omitted parameter
        /**
        * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence replaying notifications subject to a maximum time length for the replay buffer.
        * This operator is a specialization of Multicast using a ReplaySubject.
        *
        * @example
        * var res = source.replay(null, 3);
        * var res = source.replay(null, 3, 500);
        * var res = source.replay(null, 3, 500, scheduler);
        * var res = source.replay(function (x) { return x.take(6).repeat(); }, 3, 500, scheduler);
        *
        * @param selector [Optional] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive all the notifications of the source subject to the specified replay buffer trimming policy.
        * @param bufferSize [Optional] Maximum element count of the replay buffer.
        * @param windowSize [Optional] Maximum time length of the replay buffer.
        * @param scheduler [Optional] Scheduler where connected observers within the selector function will be invoked on.
        * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
        */
        replay(selector: (source: ConnectableObservable<T>) => Observable<T>, bufferSize?: number, window?: number, scheduler?: IScheduler): Observable<T>;
    }

    export interface Observable<T> {
        /**
        * Returns an observable sequence that shares a single subscription to the underlying sequence replaying notifications subject to a maximum time length for the replay buffer.
        * This operator is a specialization of replay which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
        *
        * @example
        * var res = source.shareReplay(3);
        * var res = source.shareReplay(3, 500);
        * var res = source.shareReplay(3, 500, scheduler);
        *

        * @param bufferSize [Optional] Maximum element count of the replay buffer.
        * @param window [Optional] Maximum time length of the replay buffer.
        * @param scheduler [Optional] Scheduler where connected observers within the selector function will be invoked on.
        * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
        */
        shareReplay(bufferSize?: number, window?: number, scheduler?: IScheduler): Observable<T>;
    }

    export interface ObservableStatic {
        /**
         *  Returns an observable sequence that produces a value after each period.
         *
         * @example
         *  1 - res = Rx.Observable.interval(1000);
         *  2 - res = Rx.Observable.interval(1000, Rx.Scheduler.timeout);
         *
         * @param {Number} period Period for producing the values in the resulting sequence (specified as an integer denoting milliseconds).
         * @param {Scheduler} [scheduler] Scheduler to run the timer on. If not specified, Rx.Scheduler.timeout is used.
         * @returns {Observable} An observable sequence that produces a value after each period.
         */
        interval(period: number, scheduler?: IScheduler): Observable<number>;
    }

    export interface ObservableStatic {
        /**
         *  Returns an observable sequence that produces a value after dueTime has elapsed and then after each period.
         * @param {Number} dueTime Absolute (specified as a Date object) or relative time (specified as an integer denoting milliseconds) at which to produce the first value.
         * @param {Mixed} [periodOrScheduler]  Period to produce subsequent values (specified as an integer denoting milliseconds), or the scheduler to run the timer on. If not specified, the resulting timer is not recurring.
         * @param {Scheduler} [scheduler]  Scheduler to run the timer on. If not specified, the timeout scheduler is used.
         * @returns {Observable} An observable sequence that produces a value after due time has elapsed and then each period.
         */
        timer(dueTime: number, period: number, scheduler?: IScheduler): Observable<number>;
        /**
         *  Returns an observable sequence that produces a value after dueTime has elapsed and then after each period.
         * @param {Number} dueTime Absolute (specified as a Date object) or relative time (specified as an integer denoting milliseconds) at which to produce the first value.
         * @param {Mixed} [periodOrScheduler]  Period to produce subsequent values (specified as an integer denoting milliseconds), or the scheduler to run the timer on. If not specified, the resulting timer is not recurring.
         * @param {Scheduler} [scheduler]  Scheduler to run the timer on. If not specified, the timeout scheduler is used.
         * @returns {Observable} An observable sequence that produces a value after due time has elapsed and then each period.
         */
        timer(dueTime: number, scheduler?: IScheduler): Observable<number>;
    }

    export interface Observable<T> {
        /**
        *  Time shifts the observable sequence by dueTime. The relative time intervals between the values are preserved.
        *
        * @example
        *  1 - res = Rx.Observable.delay(new Date());
        *  2 - res = Rx.Observable.delay(new Date(), Rx.Scheduler.timeout);
        *
        *  3 - res = Rx.Observable.delay(5000);
        *  4 - res = Rx.Observable.delay(5000, 1000, Rx.Scheduler.timeout);
        * @memberOf Observable#
        * @param {Number} dueTime Absolute (specified as a Date object) or relative time (specified as an integer denoting milliseconds) by which to shift the observable sequence.
        * @param {Scheduler} [scheduler] Scheduler to run the delay timers on. If not specified, the timeout scheduler is used.
        * @returns {Observable} Time-shifted sequence.
        */
        delay(dueTime: Date, scheduler?: IScheduler): Observable<T>;
        /**
        *  Time shifts the observable sequence by dueTime. The relative time intervals between the values are preserved.
        *
        * @example
        *  1 - res = Rx.Observable.delay(new Date());
        *  2 - res = Rx.Observable.delay(new Date(), Rx.Scheduler.timeout);
        *
        *  3 - res = Rx.Observable.delay(5000);
        *  4 - res = Rx.Observable.delay(5000, 1000, Rx.Scheduler.timeout);
        * @memberOf Observable#
        * @param {Number} dueTime Absolute (specified as a Date object) or relative time (specified as an integer denoting milliseconds) by which to shift the observable sequence.
        * @param {Scheduler} [scheduler] Scheduler to run the delay timers on. If not specified, the timeout scheduler is used.
        * @returns {Observable} Time-shifted sequence.
        */
        delay(dueTime: number, scheduler?: IScheduler): Observable<T>;

        /**
        *  Time shifts the observable sequence based on a subscription delay and a delay selector function for each element.
        *
        * @example
        *  1 - res = source.delayWithSelector(function (x) { return Rx.Scheduler.timer(5000); }); // with selector only
        *  1 - res = source.delayWithSelector(Rx.Observable.timer(2000), function (x) { return Rx.Observable.timer(x); }); // with delay and selector
        *
        * @param {Observable} [subscriptionDelay]  Sequence indicating the delay for the subscription to the source.
        * @param {Function} delayDurationSelector Selector function to retrieve a sequence indicating the delay for each given element.
        * @returns {Observable} Time-shifted sequence.
        */
        delay(delayDurationSelector: (item: T) => (IObservable<number> | Observable<number> | Promise<number>)): Observable<T>;

        /**
        *  Time shifts the observable sequence based on a subscription delay and a delay selector function for each element.
        *
        * @example
        *  1 - res = source.delayWithSelector(function (x) { return Rx.Scheduler.timer(5000); }); // with selector only
        *  1 - res = source.delayWithSelector(Rx.Observable.timer(2000), function (x) { return Rx.Observable.timer(x); }); // with delay and selector
        *
        * @param {Observable} [subscriptionDelay]  Sequence indicating the delay for the subscription to the source.
        * @param {Function} delayDurationSelector Selector function to retrieve a sequence indicating the delay for each given element.
        * @returns {Observable} Time-shifted sequence.
        */
        delay(subscriptionDelay: Observable<number>, delayDurationSelector: (item: T) => (IObservable<number> | Observable<number> | Promise<number>)): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  Ignores values from an observable sequence which are followed by another value before dueTime.
        * @param {Number} dueTime Duration of the debounce period for each value (specified as an integer denoting milliseconds).
        * @param {Scheduler} [scheduler]  Scheduler to run the debounce timers on. If not specified, the timeout scheduler is used.
        * @returns {Observable} The debounced sequence.
        */
        debounce(dueTime: number, scheduler?: IScheduler): Observable<T>;

        /**
        * Ignores values from an observable sequence which are followed by another value within a computed throttle duration.
        * @param {Function} durationSelector Selector function to retrieve a sequence indicating the throttle duration for each given element.
        * @returns {Observable} The debounced sequence.
        */
        debounce(debounceDurationSelector: (item: T) => (IObservable<number> | Observable<number> | Promise<number>)): Observable<T>;
    }

    export interface Timestamp<T> {
        value: T;
        timestamp: number;
    }

    export interface Observable<T> {
        /**
        *  Records the timestamp for each value in an observable sequence.
        *
        * @example
        *  1 - res = source.timestamp(); // produces { value: x, timestamp: ts }
        *  2 - res = source.timestamp(Rx.Scheduler.default);
        *
        * @param {Scheduler} [scheduler]  Scheduler used to compute timestamps. If not specified, the default scheduler is used.
        * @returns {Observable} An observable sequence with timestamp information on values.
        */
        timestamp(scheduler?: IScheduler): Observable<Timestamp<T>>;
    }

    export interface Observable<T> {
        /**
        *  Samples the observable sequence at each interval.
        *
        * @example
        *  1 - res = source.sample(sampleObservable); // Sampler tick sequence
        *  2 - res = source.sample(5000); // 5 seconds
        *  2 - res = source.sample(5000, Rx.Scheduler.timeout); // 5 seconds
        *
        * @param {Mixed} intervalOrSampler Interval at which to sample (specified as an integer denoting milliseconds) or Sampler Observable.
        * @param {Scheduler} [scheduler]  Scheduler to run the sampling timer on. If not specified, the timeout scheduler is used.
        * @returns {Observable} Sampled observable sequence.
        */
        sample(intervalOrSampler: number, scheduler?: IScheduler): Observable<T>;
        /**
        *  Samples the observable sequence at each interval.
        *
        * @example
        *  1 - res = source.sample(sampleObservable); // Sampler tick sequence
        *  2 - res = source.sample(5000); // 5 seconds
        *  2 - res = source.sample(5000, Rx.Scheduler.timeout); // 5 seconds
        *
        * @param {Mixed} intervalOrSampler Interval at which to sample (specified as an integer denoting milliseconds) or Sampler Observable.
        * @param {Scheduler} [scheduler]  Scheduler to run the sampling timer on. If not specified, the timeout scheduler is used.
        * @returns {Observable} Sampled observable sequence.
        */
        sample<TSample>(sampler: Observable<TSample>, scheduler?: IScheduler): Observable<T>;
        /**
        *  Samples the observable sequence at each interval.
        *
        * @example
        *  1 - res = source.sample(sampleObservable); // Sampler tick sequence
        *  2 - res = source.sample(5000); // 5 seconds
        *  2 - res = source.sample(5000, Rx.Scheduler.timeout); // 5 seconds
        *
        * @param {Mixed} intervalOrSampler Interval at which to sample (specified as an integer denoting milliseconds) or Sampler Observable.
        * @param {Scheduler} [scheduler]  Scheduler to run the sampling timer on. If not specified, the timeout scheduler is used.
        * @returns {Observable} Sampled observable sequence.
        */
        throttleLatest(interval: number, scheduler?: IScheduler): Observable<T>;
        /**
        *  Samples the observable sequence at each interval.
        *
        * @example
        *  1 - res = source.sample(sampleObservable); // Sampler tick sequence
        *  2 - res = source.sample(5000); // 5 seconds
        *  2 - res = source.sample(5000, Rx.Scheduler.timeout); // 5 seconds
        *
        * @param {Mixed} intervalOrSampler Interval at which to sample (specified as an integer denoting milliseconds) or Sampler Observable.
        * @param {Scheduler} [scheduler]  Scheduler to run the sampling timer on. If not specified, the timeout scheduler is used.
        * @returns {Observable} Sampled observable sequence.
        */
        throttleLatest<TSample>(sampler: Observable<TSample>, scheduler?: IScheduler): Observable<T>;
    }

    export interface Observable<T> {
        /**
        *  Returns the source observable sequence or the other observable sequence if dueTime elapses.
        * @param {Number} dueTime Absolute (specified as a Date object) or relative time (specified as an integer denoting milliseconds) when a timeout occurs.
        * @param {Scheduler} [scheduler]  Scheduler to run the timeout timers on. If not specified, the timeout scheduler is used.
        * @returns {Observable} The source sequence switching to the other sequence in case of a timeout.
        */
        timeout(dueTime: Date, scheduler?: IScheduler): Observable<T>;

        /**
        *  Returns the source observable sequence or the other observable sequence if dueTime elapses.
        * @param {Number} dueTime Absolute (specified as a Date object) or relative time (specified as an integer denoting milliseconds) when a timeout occurs.
        * @param {Observable} [other]  Sequence to return in case of a timeout. If not specified, a timeout error throwing sequence will be used.
        * @param {Scheduler} [scheduler]  Scheduler to run the timeout timers on. If not specified, the timeout scheduler is used.
        * @returns {Observable} The source sequence switching to the other sequence in case of a timeout.
        */
        timeout(dueTime: Date, other?: Observable<T>, scheduler?: IScheduler): Observable<T>;
        /**
        *  Returns the source observable sequence or the other observable sequence if dueTime elapses.
        * @param {Number} dueTime Absolute (specified as a Date object) or relative time (specified as an integer denoting milliseconds) when a timeout occurs.
        * @param {Observable} [other]  Sequence to return in case of a timeout. If not specified, a timeout error throwing sequence will be used.
        * @param {Scheduler} [scheduler]  Scheduler to run the timeout timers on. If not specified, the timeout scheduler is used.
        * @returns {Observable} The source sequence switching to the other sequence in case of a timeout.
        */
        timeout(dueTime: number, scheduler?: IScheduler): Observable<T>;
        /**
        *  Returns the source observable sequence or the other observable sequence if dueTime elapses.
        * @param {Number} dueTime Absolute (specified as a Date object) or relative time (specified as an integer denoting milliseconds) when a timeout occurs.
        * @param {Observable} [other]  Sequence to return in case of a timeout. If not specified, a timeout error throwing sequence will be used.
        * @param {Scheduler} [scheduler]  Scheduler to run the timeout timers on. If not specified, the timeout scheduler is used.
        * @returns {Observable} The source sequence switching to the other sequence in case of a timeout.
        */
        timeout(dueTime: number, other?: Observable<T>, scheduler?: IScheduler): Observable<T>;

        /**
        *  Returns the source observable sequence, switching to the other observable sequence if a timeout is signaled.
        * @param {Function} timeoutDurationSelector Selector to retrieve an observable sequence that represents the timeout between the current element and the next element.
        * @returns {Observable} The source sequence switching to the other sequence in case of a timeout.
        */
        timeout<TTimeout>(timeoutdurationSelector: (item: T) => Observable<TTimeout>): Observable<T>;

        /**
        *  Returns the source observable sequence, switching to the other observable sequence if a timeout is signaled.
        * @param {Function} timeoutDurationSelector Selector to retrieve an observable sequence that represents the timeout between the current element and the next element.
        * @param {Observable} other  Sequence to return in case of a timeout. If not provided, this is set to Observable.throwException().
        * @returns {Observable} The source sequence switching to the other sequence in case of a timeout.
        */
        timeout<TTimeout>(timeoutdurationSelector: (item: T) => Observable<TTimeout>, other: Observable<T>): Observable<T>;

        /**
        *  Returns the source observable sequence, switching to the other observable sequence if a timeout is signaled.
        * @param {Observable} [firstTimeout]  Observable sequence that represents the timeout for the first element. If not provided, this defaults to Observable.never().
        * @param {Function} timeoutDurationSelector Selector to retrieve an observable sequence that represents the timeout between the current element and the next element.
        * @param {Observable} [other]  Sequence to return in case of a timeout. If not provided, this is set to Observable.throwException().
        * @returns {Observable} The source sequence switching to the other sequence in case of a timeout.
        */
        timeout<TTimeout>(firstTimeout: Observable<TTimeout>, timeoutdurationSelector: (item: T) => Observable<TTimeout>, other?: Observable<T>): Observable<T>;
    }

    export interface Observable<T> {
        /**
        * Returns an Observable that emits only the first item emitted by the source Observable during sequential time windows of a specified duration.
        * @param {Number} windowDuration time to wait before emitting another item after emitting the last item
        * @param {Scheduler} [scheduler] the Scheduler to use internally to manage the timers that handle timeout for each item. If not provided, defaults to Scheduler.timeout.
        * @returns {Observable} An Observable that performs the throttle operation.
        */
        throttle(windowDuration: number, scheduler?: IScheduler): Observable<T>;
    }

    export interface Observable<T> {
        /**
         * Pauses the underlying observable sequence based upon the observable sequence which yields true/false.
         * @example
         * var pauser = new Rx.Subject();
         * var source = Rx.Observable.interval(100).pausable(pauser);
         * @param {Observable} pauser The observable sequence used to pause the underlying sequence.
         * @returns {Observable} The observable sequence which is paused based upon the pauser.
         */
        pausable(pauser?: Observable<boolean>): PausableObservable<T>;
    }

    export interface PausableObservable<T> extends Observable<T> {
        pause(): void;
        resume(): void;
    }

    export interface Observable<T> {
        /**
         * Pauses the underlying observable sequence based upon the observable sequence which yields true/false,
         * and yields the values that were buffered while paused.
         * @example
         * var pauser = new Rx.Subject();
         * var source = Rx.Observable.interval(100).pausableBuffered(pauser);
         * @param {Observable} pauser The observable sequence used to pause the underlying sequence.
         * @returns {Observable} The observable sequence which is paused based upon the pauser.
         */
        pausableBuffered(pauser?: Observable<boolean>): PausableObservable<T>;
    }

    export interface Observable<T> {
        /**
        * Attaches a controller to the observable sequence with the ability to queue.
        * @example
        * var source = Rx.Observable.interval(100).controlled();
        * source.request(3); // Reads 3 values
        * @param {bool} enableQueue truthy value to determine if values should be queued pending the next request
        * @param {Scheduler} scheduler determines how the requests will be scheduled
        * @returns {Observable} The observable sequence which only propagates values on request.
        */
        controlled(enableQueue?: boolean, scheduler?: IScheduler): ControlledObservable<T>;
    }

    export interface ControlledObservable<T> extends Observable<T> {
        request(numberOfItems?: number): IDisposable;
    }

    export interface Observable<T> {
        /**
        * Pipes the existing Observable sequence into a Node.js Stream.
        * @param {Stream} dest The destination Node.js stream.
        * @returns {Stream} The destination stream.
        */
        pipe<TDest>(dest: TDest): TDest;
        // TODO: Add link to node.d.ts some where
    }

    export interface Observable<T> {
        /**
         * Executes a transducer to transform the observable sequence
         * @param {Transducer} transducer A transducer to execute
         * @returns {Observable} An Observable sequence containing the results from the transducer.
         */
        transduce(transducer: any): any;
        //TODO: Setup transducer
    }

    export interface AnonymousObservable<T> extends Observable<T> { }

    export interface AsyncSubject<T> extends Subject<T> { }

    interface AsyncSubjectStatic {
        /**
         * Creates a subject that can only receive one value and that value is cached for all future observations.
         * @constructor
         */
        new <T>(): AsyncSubject<T>;
    }

    /**
     *  Represents the result of an asynchronous operation.
     *  The last value before the OnCompleted notification, or the error received through OnError, is sent to all subscribed observers.
     */
    export var AsyncSubject: AsyncSubjectStatic;

    export interface AnonymousSubject<T> extends Subject<T> { }

    interface AnonymousSubjectStatic {
        /**
         * Creates a subject that can only receive one value and that value is cached for all future observations.
         * @constructor
         */
        new <T>(): AnonymousSubject<T>;
    }

    /**
     *  Represents the result of an asynchronous operation.
     *  The last value before the OnCompleted notification, or the error received through OnError, is sent to all subscribed observers.
     */
    export var AnonymousSubject: AnonymousSubjectStatic;

    export interface BehaviorSubject<T> extends Subject<T> {
        /**
         * Gets the current value or throws an exception.
         * Value is frozen after onCompleted is called.
         * After onError is called always throws the specified exception.
         * An exception is always thrown after dispose is called.
         * @returns {Mixed} The initial value passed to the constructor until onNext is called; after which, the last value passed to onNext.
         */
        getValue(): T;
    }

    interface BehaviorSubjectStatic {
        /**
         *  Initializes a new instance of the BehaviorSubject class which creates a subject that caches its last value and starts with the specified value.
         *  @param {Mixed} value Initial value sent to observers when no other value has been received by the subject yet.
         */
        new <T>(initialValue: T): BehaviorSubject<T>;
    }

    /**
     *  Represents a value that changes over time.
     *  Observers can subscribe to the subject to receive the last (or initial) value and all subsequent notifications.
     */
    export var BehaviorSubject: BehaviorSubjectStatic;

    export interface ReplaySubject<T> extends Subject<T> { }

    interface ReplaySubjectStatic {
        /**
         *  Initializes a new instance of the ReplaySubject class with the specified buffer size, window size and scheduler.
         *  @param {Number} [bufferSize] Maximum element count of the replay buffer.
         *  @param {Number} [windowSize] Maximum time length of the replay buffer.
         *  @param {Scheduler} [scheduler] Scheduler the observers are invoked on.
         */
        new <T>(bufferSize?: number, window?: number, scheduler?: IScheduler): ReplaySubject<T>;
    }

    /**
    * Represents an object that is both an observable sequence as well as an observer.
    * Each notification is broadcasted to all subscribed and future observers, subject to buffer trimming policies.
    */
    export var ReplaySubject: ReplaySubjectStatic;

    /**
    * Used to pause and resume streams.
    */
    export interface Pauser {
        /**
         * Pauses the underlying sequence.
         */
        pause(): void;

        /**
        * Resumes the underlying sequence.
        */
        resume(): void;
    }

}

declare module "rx" { export = Rx; }
declare module "rx.lite" { export = Rx; }
