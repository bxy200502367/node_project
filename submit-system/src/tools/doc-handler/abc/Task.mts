/*
 * @LastEditTime: 2024/02/07
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import { DocHandler } from '../../DocHandler.mjs';
import { TaskType } from '../TaskFactory.mjs';

/**
 * Task 是一个抽象类，定义了任务需要实现的接口。
 */
abstract class Task {
    protected task: DocHandler;
    public taskType: TaskType;

    /**
     * Task 的构造函数。
     * @param task 任务对象。
     * @param taskType 任务的名称。
     */
    constructor(task: DocHandler, taskType: TaskType) {
        this.task = task;
        this.taskType = taskType;
    }

    // 抽象方法，必须在子类中实现
    abstract handle(): void;
}

// 导出你的类
export { Task };