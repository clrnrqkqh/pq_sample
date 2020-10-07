# 그리드 기능 공유 #

그리드 기능별 예제 페이지 작성 및 기능 공유 목적.

### task1  정의내용  ###

* task1 소스검색 
* 검색파일  **grid_checkbox.html, grid_checkbox.js pqgrid.dev.js**  파일에서 검색요망
* 행단위 선택 모드인경우 키보드 상하 이동시에 반전기능 연동 및 소트후 반전상태 및 스크롤상태 정의
*
* /. --> [START] 수정자: Kim changeha 수정일자:2020:09:24
* //수정내용> {task1}:[기능추가]방향키 이동시에 행 자동이동 기능
* // 1) 소트시에 반전상태 유지 또는이동기능, 스크롤 이동유무 처리
* // selectionModel={ sortRow : {selMove:false,   false:반전상태 유지(기본값), true: 현재상태 유지 
* //                                scrollRow : "top", "top": 상단, "center":중앙
* //                               }          
* //  <-- [End]
*

### 복수줄 관련 기능 정의  ###
* 복수줄 관련 정렬 및 복수라인  관련
*
*  **복수줄 가로정렬**
* .pq-theme .pq-align-left{ 
*    text-align:left;
*  }   
*  **복수줄 우측정렬**
*  .pq-theme .pq-align-right{ 
*    text-align:right;
*  } 
  
  
* **복수줄 cls(높이 자동조절 필요)**  
* .pq-multi_line {
*    border-bottom: 1px solid #a8c4dc;
*    margin-bottom: -1px;
*    margin-left: -3px;
*    margin-right: -3px;
*  }
*
* 상단컬럼 하단컬럼 참고
*
*let text = "<div class='pq-multi_line'>" + pq.formatNumber(ui.cellData,"#,###") *+ "</div>" + "<div class='pq-align-right'>" + pq.formatNumber(ui.rowData.test1,"#,###")+ "</div>"
