import type { Template } from '@/types/editor'

export const templates: Template[] = [
  {
    id: 'game-review',
    name: '게임 리뷰',
    description: '게임 리뷰를 위한 기본 템플릿',
    blocks: [
      {
        id: 'header',
        type: 'text',
        content: {
          text: '# 게임 리뷰: [게임 제목]'
        },
        settings: {
          style: {
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '20px'
          }
        }
      },
      {
        id: 'main-image',
        type: 'image',
        content: {
          imageUrl: ''
        },
        settings: {
          style: {
            width: '100%',
            marginBottom: '20px'
          }
        }
      },
      {
        id: 'review-text',
        type: 'text',
        content: {
          text: '여기에 리뷰 내용을 작성하세요.'
        },
        settings: {
          style: {
            lineHeight: '1.6'
          }
        }
      }
    ]
  },
  {
    id: 'esports-news',
    name: 'e스포츠 소식',
    description: 'e스포츠 소식을 위한 템플릿',
    blocks: [
      // ... 비슷한 구조로 정의
    ]
  },
  {
    id: 'game-update',
    name: '업데이트 소식',
    description: '게임 업데이트 소식을 위한 템플릿',
    blocks: [
      // ... 비슷한 구조로 정의
    ]
  }
] 