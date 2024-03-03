/*
 * @LastEditTime: 2024/02/21
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import to from 'await-to-js';
import { Task } from '../abc/Task.mjs'
import { Submit } from '../../task-manager/Submit.mjs'
import { TaskType } from '../TaskFactory.mjs'

class LibrarySplitDeliverState extends Task {
    public async handle() {
        const taskSn = this.task.taskSn;
        const taskFactory = this.task.taskFactory;
        const params = {
            split_id: this.task.splitId.toString(),
            data_source: "library"
        };
        const url = '/s/datasplit_v3/data_split';
        const submitInstance = new Submit({
            api: url,
            params: params
        });

        let error, submit_result;

        for (let i = 0; i < 3; i++) { // 尝试3次
            [error, submit_result] = await to(submitInstance.sendApiRequest());

            if (submit_result && submit_result["success"]) {
                this.task.logger.info(`任务 ${taskSn} 文库拆分请求成功！`);
                this.task.currentState = taskFactory.createTask(TaskType.SuccessProcessedState);
                break;
            }
        }

        if (!submit_result || !submit_result["success"]) {
            this.task.logger.error(`任务 ${taskSn} 文库拆分请求失败: ${submit_result ? submit_result["info"] : error?.message}!`);
            this.task.currentState = taskFactory.createTask(TaskType.FailedProcessedState);
        }

        this.task.logger.info(`任务 ${taskSn} 接口返回结果为: ${JSON.stringify(submit_result, null, 0)}`);
    }
}

export { LibrarySplitDeliverState }