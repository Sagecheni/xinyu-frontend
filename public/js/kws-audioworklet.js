// public/js/kws-audioworklet.js

// CHUNK_DURATION_S 和 SAMPLES_PER_CHUNK 现在基于 targetSampleRate
const CHUNK_DURATION_S = 0.1;

class KwsAudioProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super();
        this.inputSampleRate = options.processorOptions.inputSampleRate;
        this.targetSampleRate = options.processorOptions.targetSampleRate;
        this.targetChannels = options.processorOptions.targetChannels || 1; // 默认为单声道

        // SAMPLES_PER_CHUNK 现在基于 targetSampleRate
        this.SAMPLES_PER_CHUNK_TARGET =
            this.targetSampleRate * CHUNK_DURATION_S;

        this.inputBuffer = []; // 存储输入采样率的音频数据
        this.resampleRatio = this.inputSampleRate / this.targetSampleRate;

        // 如果采样率已匹配，则不需要重采样
        this.needsResampling = this.inputSampleRate !== this.targetSampleRate;

        console.log(
            `[AudioWorklet] Initialized. Input SR: ${this.inputSampleRate}, Target SR: ${this.targetSampleRate}, Ratio: ${this.resampleRatio}, Needs Resampling: ${this.needsResampling}`
        );

    }

    // 简单的线性插值重采样函数
    resampleLinear(inputBuffer, outputSampleRate, inputSampleRate) {
        if (inputSampleRate === outputSampleRate) {
            return [...inputBuffer]; // 直接复制
        }
        const ratio = inputSampleRate / outputSampleRate;
        const outputLength = Math.floor(inputBuffer.length / ratio);
        const outputBuffer = new Float32Array(outputLength);

        for (let i = 0; i < outputLength; i++) {
            const theoreticalIndex = i * ratio;
            const indexPrev = Math.floor(theoreticalIndex);
            const indexNext = Math.min(indexPrev + 1, inputBuffer.length - 1);
            const fraction = theoreticalIndex - indexPrev;

            outputBuffer[i] =
                inputBuffer[indexPrev] +
                (inputBuffer[indexNext] - inputBuffer[indexPrev]) * fraction;
        }
        return outputBuffer;
    }

    process(inputs, outputs, parameters) {
        const inputChannelData = inputs[0]?.[0]; // 安全地访问第一个声道
        if (!inputChannelData) {
            return true;
        }

        // 将新数据加入输入缓冲区 (Float32)
        for (let i = 0; i < inputChannelData.length; i++) {
            this.inputBuffer.push(inputChannelData[i]);
        }

        // 确定处理多少输入样本能产生足够的目标输出块
        // 所需的输入样本数，大致等于目标块样本数 * 比例
        const requiredInputSamplesForOneTargetChunk = Math.ceil(
            this.SAMPLES_PER_CHUNK_TARGET * this.resampleRatio
        );

        while (
            this.inputBuffer.length >= requiredInputSamplesForOneTargetChunk
        ) {
            // 取出足够用于产生一个目标块的输入样本
            // 注意：这里简单取 requiredInputSamplesForOneTargetChunk，实际更精确的重采样器会动态调整
            const currentInputSegment = this.inputBuffer.splice(
                0,
                requiredInputSamplesForOneTargetChunk
            );

            let samplesToProcess = currentInputSegment;
            if (this.needsResampling) {
                samplesToProcess = this.resampleLinear(
                    currentInputSegment,
                    this.targetSampleRate,
                    this.inputSampleRate
                );
            }

            if (samplesToProcess.length === 0) continue;

            // 将 Float32 PCM 数据 (-1.0 to 1.0) 转换为 Int16 PCM 数据 (-32768 to 32767)
            // 确保发送的块是 SAMPLES_PER_CHUNK_TARGET 长度
            const int16Array = new Int16Array(this.SAMPLES_PER_CHUNK_TARGET);
            for (let i = 0; i < this.SAMPLES_PER_CHUNK_TARGET; i++) {
                if (i < samplesToProcess.length) {
                    const s = Math.max(-1, Math.min(1, samplesToProcess[i]));
                    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
                } else {
                    int16Array[i] = 0; // 如果重采样数据不足，用静音填充 (简单处理)
                }
            }

            this.port.postMessage(int16Array.buffer, [int16Array.buffer]);
        }
        return true;
    }
}

try {
    registerProcessor("kws-audio-processor", KwsAudioProcessor);
} catch (e) {
    console.error("[AudioWorklet] Error registering kws-audio-processor:", e);
    throw e; // 重新抛出错误，确保 addModule 的 promise 会 reject
}
