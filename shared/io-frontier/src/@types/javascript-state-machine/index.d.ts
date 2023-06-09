// hint: 第三方并没有 v3 版本的 ts 定义文件，所以我在这里自己定义一个
declare module 'javascript-state-machine' {
	declare class StateMachine {
		constructor(options: Partial<StateMachine.Options>);
		static factory(options: Partial<StateMachine.Options>): StateMachine.IFSM;
		static factory<T>(options: Partial<StateMachine.Options<T>>): StateMachine.IFSM<T>;
		static factory<T>(instance: T, options: Partial<StateMachine.Options>): StateMachine.IFSM | T;
		[action: string]: ((...args: any[]) => any);
		state: string;
		is: StateMachine.StateMachineIs;
		can: StateMachine.StateMachineCan;
		cannot: StateMachine.StateMachineCan;
		transitions: StateMachine.StateMachineTransitions;
		allTransitions: StateMachine.StateMachineTransitions;
		allStates: StateMachine.StateMachineStates;
		observe: StateMachine.Observe;
		// history: string[];
		historyBack();
		historyForward();
	}

	declare namespace StateMachine {
		const VERSION: string; 		        // = "3.x.x"
		const defaults: {
			wildcard: '*',
			init: {
				name: 'init',
				from: 'none'
			}
		};
		// types
		type StateMachineIs = (state: string) => boolean;
		type StateMachineCan = (evt: string) => boolean;
		type StateMachineTransitions = () => string[];
		type StateMachineStates = () => string[];
		type Callback = (...args: any[]) => any;
		interface Observe {
			(event: string, callback: Callback): void;
			[name: string]: Callback;
		}

		interface LifeCycle {
			transition: string;
			from: string;
			to: string;
		}

		interface Options<T> {
			name: string;
			past: string;
			future: string;
			init: string;
			max: number;	// max history
			state: string;
			transitions: {
				name: string;
				from: string | string[] | '*';
				to: string | ((...args: any[]) => string);
			}[];
			methods: {
				[method: string]: Callback;
				onBeforeTransition?(lifecycle: LifeCycle, ...args: any[]): boolean | Promise<boolean>;	// 1
				onLeaveState?(lifecycle: LifeCycle, ...args: any[]): boolean | Promise<boolean>;	// 2
				onTransition?(lifecycle: LifeCycle, ...args: any[]): boolean | Promise<boolean>;	// 3
				onEnterState?(lifecycle: LifeCycle, ...args: any[]): any | Promise<any>;	// 4
				onAfterTransition?(lifecycle: LifeCycle, ...args: any[]): any | Promise<any>;	// 5
				onPendingTransition?(transition: string, from: string, to: string): any | Promise<any>;
			};
			data: any;	// {} | any[] | ((...args: any[]) => {} | any[]);
			plugins: any[];
		}

		interface IFSM {
			new(...data: any[]): StateMachine;
		}

		interface IFSM<T> {
			new(...data: any[]): StateMachine & T;
		}
	}

	export = StateMachine;
	export as namespace StateMachine;
}