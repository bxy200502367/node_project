/*
 * @LastEditTime: 2024/02/07
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */


import { Task } from '../abc/Task.mjs'
import { TaskType } from '../TaskFactory.mjs'

/**
 * FailedProcessedState 类
 * 这个类继承了 Task 类，并实现了 handle 方法
 * handle 方法用于处理未知状态的操作
 */
class UnknownState extends Task {
    public async handle() {
        this.task.logger.error(`任务 ${this.task.taskSn} 的处理状态处于一个未被定义的状态 ${this.taskType}, 请联系维护者查看`);
        this.task.currentState = this.task.taskFactory.createTask(TaskType.FailedProcessedState);
    }
}

export { UnknownState }