import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { handleApiError } from '../utils/errorHandler';
import * as chatApi from '../api/chat';
import type { ErrorResponse } from '../types/api.types';

export const useChatSend = () => {
  return useMutation({
    mutationFn: (request: chatApi.ChatRequest) => chatApi.sendChat(request),
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};
