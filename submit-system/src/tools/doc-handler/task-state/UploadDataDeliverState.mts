/*
 * @LastEditTime: 2024/04/03
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import to from 'await-to-js';
import { Task } from '../abc/Task.mjs'
import { Submit } from '../../task-manager/Submit.mjs'
import { TaskType } from '../TaskFactory.mjs'


/**
 * UploadDataDeliverState 类
 * 这个类继承了 Task 类，并实现了 handle 方法
 * handle 方法用于处理确认使用后数据上传请求或者更新数据库
 */
class UploadDataDeliverState extends Task {
    public async handle() {
        const taskSn = this.task.taskSn;
        const taskFactory = this.task.taskFactory;
        const { firstSplitWorkdir, allPureSequence, hasMeta, useProcess, uploadProcess } = this.task.extraProps;
        const cluster = firstSplitWorkdir?.split("/")[2];
        if (allPureSequence && !hasMeta &&
            useProcess && uploadProcess &&
            useProcess > uploadProcess) {
            let params: { [key: string]: boolean | number | string } = {
                split_id: this.task.splitId.toString(),
                data_source: "upload",
            };
            if (cluster !== undefined) {
                params.cluster = cluster;
            }
            const url = '/s/datasplit_v3/data_split';
            const submitInstance = new Submit({
                api: url,
                params: params,
            });

            let error, submit_result;

            for (let i = 0; i < 3; i++) {
                [error, submit_result] = await to(submitInstance.sendApiRequest());

                if (submit_result && submit_result["success"]) {
                    this.task.logger.info(`任务 ${taskSn} 样本上传请求成功！`);
                    this.task.currentState = taskFactory.createTask(TaskType.SuccessProcessedState);
                    break;
                }
            }

            if (!submit_result || !submit_result["success"]) {
                this.task.logger.error(`任务 ${taskSn} 样本上传请求失败: ${submit_result ? submit_result["info"] : error?.message}!`);
                this.task.currentState = taskFactory.createTask(TaskType.FailedProcessedState);
            }

            this.task.logger.info(`任务 ${taskSn} 接口返回结果为: ${JSON.stringify(submit_result, null, 0)}`);
        } else {
            const update = {
                "split_status.upload": "end",
                "status": "end",
                "desc": "Job has been finished"
            }
            const [error, _] = await to(this.task.sgSplitCol.updateOne(this.task.queryMain, { $set: update }))
            if (error) {
                this.task.logger.warn(`任务 ${taskSn} 数据库更新失败: ${error.message}`)
                this.task.currentState = taskFactory.createTask(TaskType.FailedProcessedState);
            } else {
                this.task.logger.info(`任务 ${taskSn} 不需要进行样本上传, 直接更新数据库`)
                this.task.currentState = taskFactory.createTask(TaskType.SuccessProcessedState);
            }
        }
    }
}

export { UploadDataDeliverState };