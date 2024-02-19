/*
 * @LastEditTime: 2024/02/18
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import to from 'await-to-js';
import { Task } from '../abc/Task.mjs'
import { Submit } from '../../task-manager/Submit.mjs'
import { TaskType } from '../TaskFactory.mjs'


/**
 * SampleSplitDeliverState 类
 * 这个类继承了 Task 类，并实现了 handle 方法
 * handle 方法用于处理样本拆分请求或者更新数据库
 */
class SampleSplitDeliverState extends Task {
    public async handle() {
        const taskSn = this.task.taskSn;
        const taskFactory = this.task.taskFactory;
        if (this.task.extraProps.hasMeta) {
            const params = {
                split_id: this.task.splitId.toString(),
                data_source: "sample"
            };
            const url = '/s/datasplit_v3/data_split';
            const submitInstance = new Submit({
                api: url,
                params: params
            });
            const [error, submit_result] = await to(submitInstance.sendApiRequest());
            if (submit_result && submit_result["success"]) {
                this.task.logger.info(`任务 ${taskSn} 样本拆分请求成功！`);
                this.task.currentState = taskFactory.createTask(TaskType.SuccessProcessedState);
            } else {
                this.task.logger.error(`任务 ${taskSn} 样本拆分请求失败: ${error?.message}!`);
                this.task.currentState = taskFactory.createTask(TaskType.FailedProcessedState);
            }
            this.task.logger.info(`任务 ${taskSn} 接口返回结果为: ${JSON.stringify(submit_result, null, 0)}`);
        } else {
            const update = {
                "split_status.second_split": "end",
                "status": "no"
            }
            const [error, _] = await to(this.task.sgSplitCol.updateOne(this.task.queryMain, { $set: update }))
            if (error) {
                this.task.logger.warn(`任务 ${taskSn} 数据库更新失败: ${error.message}`)
                this.task.currentState = taskFactory.createTask(TaskType.FailedProcessedState);
            } else {
                this.task.logger.info(`任务 ${taskSn} 不需要进行样本拆分, 直接更新数据库`)
                this.task.currentState = taskFactory.createTask(TaskType.SuccessProcessedState);
            }
        }
    }
}

export { SampleSplitDeliverState };