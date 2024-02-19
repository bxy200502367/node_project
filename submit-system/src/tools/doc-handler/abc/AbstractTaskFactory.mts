/*
 * @LastEditTime: 2024/02/05
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import { TaskState, TaskType } from '../TaskFactory.mjs';

/**
 * AbstractTaskFactory 是一个抽象类，定义了任务工厂需要实现的接口。
 */
abstract class AbstractTaskFactory {
    /**
     * createTask 是一个抽象方法，需要在派生类中实现。
     * @param taskType 任务类型的字符串表示。
     * @returns 返回创建的任务对象。
     */
    public abstract createTask(taskType: TaskType): TaskState;
}

// 导出你的类
export { AbstractTaskFactory };