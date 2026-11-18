  (func (;1756;) (type 11) (param i32 i32 i32 i32 i32 i32)
    (local i32 i32 i32 i32)
    global.get 0
    i32.const 32
    i32.sub
    local.tee 6
    global.set 0
    i32.const 6776621
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 5608692
      call 599
      i32.const 5619016
      call 599
      i32.const 5619272
      call 599
      i32.const 5619996
      call 599
      i32.const 5621832
      call 599
      i32.const 5621884
      call 599
      i32.const 5648380
      call 599
      i32.const 5610404
      call 599
      i32.const 5623260
      call 599
      i32.const 5625308
      call 599
      i32.const 5690436
      call 599
      i32.const 5625616
      call 599
      i32.const 5618116
      call 599
      i32.const 5669844
      call 599
      i32.const 5716040
      call 599
      i32.const 5716044
      call 599
      i32.const 5716048
      call 599
      i32.const 5640156
      call 599
      i32.const 5673040
      call 599
      i32.const 5634068
      call 599
      i32.const 6776621
      i32.const 1
      i32.store8
    end
    local.get 6
    i64.const 0
    i64.store offset=24
    block  ;; label = @1
      i32.const 5623260
      i32.load
      local.tee 5
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 5
      else
        local.get 5
        call 600
        i32.const 5623260
        i32.load
      end
      i32.load offset=92
      i32.load8_u offset=2400
      br_if 0 (;@1;)
      block (result i32)  ;; label = @2
        local.get 1
        i32.const 0
        call 25903
        local.tee 5
        if  ;; label = @3
          i32.const 0
          local.get 5
          i32.load offset=8
          br_if 1 (;@2;)
          drop
        end
        i32.const 1
      end
      if  ;; label = @2
        block (result i32)  ;; label = @3
          local.get 1
          i32.const 0
          call 7236
          local.tee 5
          if  ;; label = @4
            i32.const 0
            local.get 5
            i32.load offset=8
            br_if 1 (;@3;)
            drop
          end
          i32.const 1
        end
        br_if 1 (;@1;)
      end
      local.get 0
      i32.const 0
      i32.const 0
      i32.const 0
      local.get 6
      call 12571
    end
    local.get 0
    local.get 1
    i32.store offset=12
    i32.const 5634068
    i32.load
    local.tee 5
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 5
      call 600
    end
    i32.const 0
    call 49220
    local.set 8
    i32.const 5618116
    i32.load
    i32.const 5
    call 616
    local.set 5
    local.get 6
    local.get 2
    i32.store8 offset=23
    block  ;; label = @1
      i32.const 5619996
      i32.load
      local.get 6
      i32.const 23
      i32.add
      call 610
      local.tee 7
      if  ;; label = @2
        local.get 7
        local.get 5
        i32.load
        i32.load offset=32
        call 609
        i32.eqz
        br_if 1 (;@1;)
      end
      local.get 5
      local.get 7
      i32.store offset=16
      local.get 3
      if  ;; label = @2
        local.get 3
        local.get 5
        i32.load
        i32.load offset=32
        call 609
        i32.eqz
        br_if 1 (;@1;)
      end
      local.get 5
      local.get 3
      i32.store offset=20
      local.get 6
      local.get 4
      i32.store8 offset=22
      i32.const 5619996
      i32.load
      local.get 6
      i32.const 22
      i32.add
      call 610
      local.tee 3
      if  ;; label = @2
        local.get 3
        local.get 5
        i32.load
        i32.load offset=32
        call 609
        i32.eqz
        br_if 1 (;@1;)
      end
      local.get 5
      local.get 3
      i32.store offset=24
      local.get 6
      local.get 0
      i32.load offset=12
      i32.const 0
      call 7237
      i64.store offset=8
      i32.const 5625308
      i32.load
      local.get 6
      i32.const 8
      i32.add
      call 610
      local.tee 3
      if  ;; label = @2
        local.get 3
        local.get 5
        i32.load
        i32.load offset=32
        call 609
        i32.eqz
        br_if 1 (;@1;)
      end
      local.get 5
      local.get 3
      i32.store offset=28
      i32.const 5621832
      i32.load
      local.tee 3
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 3
        call 600
      end
      local.get 6
      i32.const 0
      call 1999
      i64.store offset=24
      local.get 6
      local.get 6
      i32.const 24
      i32.add
      i32.const 0
      call 9297
      i64.store
      i32.const 5625308
      i32.load
      local.get 6
      call 610
      local.tee 3
      if  ;; label = @2
        local.get 3
        local.get 5
        i32.load
        i32.load offset=32
        call 609
        i32.eqz
        br_if 1 (;@1;)
      end
      local.get 5
      local.get 3
      i32.store offset=32
      local.get 8
      local.get 5
      i32.const 0
      call 963
      local.set 3
      i32.const 5621884
      i32.load
      local.tee 5
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 5
        call 600
      end
      local.get 3
      i32.const 0
      call 690
      i32.const 6776650
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 5634068
        call 599
        i32.const 6776650
        i32.const 1
        i32.store8
      end
      i32.const 5634068
      i32.load
      local.tee 3
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 3
        call 600
      end
      i32.const 0
      call 18668
      f32.const 0x1.8p-1 (;=0.75;)
      i32.const 0
      call 3772
      i32.const 0
      call 4323
      i32.const 30
      i32.const -1
      local.get 1
      i32.const 0
      call 12431
      i32.const 30
      i32.eq
      select
      local.set 1
      i32.const 5619272
      i32.load
      local.tee 3
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 3
        call 600
      end
      local.get 1
      i32.const 0
      call 11361
      local.get 6
      local.get 0
      i32.load offset=12
      local.get 6
      call 10257
      local.get 0
      i32.load offset=12
      local.set 1
      i32.const 6776674
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 5619148
        call 599
        i32.const 5632156
        call 599
        i32.const 6776674
        i32.const 1
        i32.store8
      end
      i32.const 5619148
      i32.load
      local.tee 3
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 3
        call 600
      end
      i32.const 0
      call 3126
      local.set 3
      local.get 6
      call 3840
      local.set 5
      local.get 1
      local.get 3
      i32.const 5632156
      i32.load
      local.tee 1
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 1
      else
        local.get 1
        call 600
        i32.const 5632156
        i32.load
      end
      i32.load offset=92
      i32.load
      local.get 5
      i32.const 0
      call 676
      i32.const 0
      call 25907
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            local.get 2
            if  ;; label = @5
              local.get 0
              i32.load offset=12
              local.set 1
              i32.const 5634068
              i32.load
              local.tee 2
              i32.load offset=116
              i32.eqz
              if  ;; label = @6
                local.get 2
                call 600
              end
              local.get 1
              i32.const 0
              call 2072
              i32.const 0
              call 43225
              local.get 0
              i32.load offset=12
              local.set 1
              i32.const 5621832
              i32.load
              local.tee 2
              i32.load offset=116
              i32.eqz
              if  ;; label = @6
                local.get 2
                call 600
              end
              local.get 6
              i32.const 0
              call 1999
              i64.store offset=24
              local.get 1
              local.get 6
              i32.const 24
              i32.add
              i32.const 0
              call 9297
              i32.const 0
              call 17546
              i32.const 5640156
              i32.load
              local.tee 5
              i32.load offset=116
              i32.eqz
              if  ;; label = @6
                local.get 5
                call 600
                i32.const 5640156
                i32.load
                local.set 5
              end
              local.get 5
              i32.load offset=92
              i32.load offset=20
              local.tee 3
              i32.eqz
              if  ;; label = @6
                local.get 5
                i32.load offset=116
                if (result i32)  ;; label = @7
                  local.get 5
                else
                  local.get 5
                  call 600
                  i32.const 5640156
                  i32.load
                end
                i32.load offset=92
                i32.load
                local.set 1
                i32.const 5619016
                i32.load
                call 603
                local.tee 3
                local.get 1
                i32.const 5716040
                i32.load
                i32.const 0
                call 786
                i32.const 5640156
                i32.load
                local.tee 5
                i32.load offset=92
                local.get 3
                i32.store offset=20
              end
              local.get 5
              i32.load offset=116
              i32.eqz
              if  ;; label = @6
                local.get 5
                call 600
                i32.const 5640156
                i32.load
                local.set 5
              end
              local.get 5
              i32.load offset=92
              i32.load offset=24
              local.tee 1
              i32.eqz
              if  ;; label = @6
                local.get 5
                i32.load offset=116
                if (result i32)  ;; label = @7
                  local.get 5
                else
                  local.get 5
                  call 600
                  i32.const 5640156
                  i32.load
                end
                i32.load offset=92
                i32.load
                local.set 2
                i32.const 5608692
                i32.load
                call 603
                local.tee 1
                local.get 2
                i32.const 5716044
                i32.load
                i32.const 0
                call 753
                i32.const 5640156
                i32.load
                local.tee 5
                i32.load offset=92
                local.get 1
                i32.store offset=24
              end
              local.get 5
              i32.load offset=116
              i32.eqz
              if  ;; label = @6
                local.get 5
                call 600
                i32.const 5640156
                i32.load
                local.set 5
              end
              local.get 5
              i32.load offset=92
              i32.load offset=28
              local.tee 2
              i32.eqz
              if  ;; label = @6
                local.get 5
                i32.load offset=116
                if (result i32)  ;; label = @7
                  local.get 5
                else
                  local.get 5
                  call 600
                  i32.const 5640156
                  i32.load
                end
                i32.load offset=92
                i32.load
                local.set 5
                i32.const 5619016
                i32.load
                call 603
                local.tee 2
                local.get 5
                i32.const 5716048
                i32.load
                i32.const 0
                call 786
                i32.const 5640156
                i32.load
                i32.load offset=92
                local.get 2
                i32.store offset=28
              end
              block  ;; label = @6
                local.get 0
                i32.load8_u offset=81
                br_if 0 (;@6;)
                local.get 0
                i32.load offset=16
                i32.eqz
                if  ;; label = @7
                  i32.const 5669844
                  i32.load
                  call 644
                  local.set 5
                  local.get 0
                  i32.load offset=68
                  local.set 7
                  i32.const 5623260
                  i32.load
                  local.tee 8
                  i32.load offset=116
                  i32.eqz
                  if  ;; label = @8
                    local.get 8
                    call 600
                  end
                  local.get 5
                  local.get 7
                  i32.const 0
                  call 12586
                  local.get 0
                  i32.load offset=12
                  local.get 3
                  local.get 1
                  local.get 2
                  f32.const -0x1p+0 (;=-1;)
                  i32.const 0
                  call 1679
                  br 1 (;@6;)
                end
                i32.const 5610404
                i32.load
                call 603
                i32.const 5648380
                i32.load
                call 774
                local.get 0
                i32.load offset=12
                local.set 5
                local.get 0
                i32.load offset=16
                local.set 7
                i32.const 6236660
                i32.const 0
                i32.store
                i32.const 3971
                local.get 0
                local.get 7
                local.get 5
                local.get 6
                call 16
                local.set 5
                i32.const 6236660
                i32.load
                local.set 7
                i32.const 6236660
                i32.const 0
                i32.store
                local.get 7
                i32.const 1
                i32.eq
                if  ;; label = @7
                  i32.const 4837720
                  call 0
                  local.set 5
                  block (result i32)  ;; label = @8
                    call 1
                    i32.const 4837720
                    call 9
                    i32.eq
                    if  ;; label = @9
                      local.get 5
                      call 7
                      local.set 1
                      i32.const 6236660
                      i32.const 0
                      i32.store
                      i32.const 325
                      i32.const 5622720
                      call 2
                      local.set 2
                      i32.const 6236660
                      i32.load
                      local.set 3
                      i32.const 6236660
                      i32.const 0
                      i32.store
                      block  ;; label = @10
                        local.get 3
                        i32.const 1
                        i32.eq
                        br_if 0 (;@10;)
                        local.get 1
                        i32.load
                        i32.load
                        local.set 3
                        i32.const 6236660
                        i32.const 0
                        i32.store
                        i32.const 326
                        local.get 2
                        local.get 3
                        call 3
                        local.set 2
                        i32.const 6236660
                        i32.load
                        local.set 3
                        i32.const 6236660
                        i32.const 0
                        i32.store
                        local.get 3
                        i32.const 1
                        i32.eq
                        br_if 0 (;@10;)
                        local.get 2
                        if  ;; label = @11
                          local.get 1
                          i32.load
                          local.set 1
                          call 13
                          i32.const 5634068
                          call 602
                          local.tee 2
                          i32.load offset=116
                          i32.eqz
                          if  ;; label = @12
                            local.get 2
                            call 600
                          end
                          i32.const 0
                          call 49219
                          local.get 0
                          i32.load offset=68
                          local.get 1
                          i32.const 0
                          call 733
                          local.set 1
                          i32.const 5621884
                          call 602
                          local.tee 2
                          i32.load offset=116
                          i32.eqz
                          if  ;; label = @12
                            local.get 2
                            call 600
                          end
                          local.get 1
                          i32.const 0
                          call 732
                          i32.const 0
                          call 49218
                          local.set 1
                          i32.const 0
                          call 4424
                          local.set 2
                          local.get 0
                          i32.load offset=68
                          local.set 3
                          i32.const 5619148
                          call 602
                          local.tee 4
                          i32.load offset=116
                          i32.eqz
                          if  ;; label = @12
                            local.get 4
                            call 600
                          end
                          local.get 1
                          local.get 2
                          local.get 3
                          i32.const 0
                          call 1130
                          i32.const 5623260
                          call 602
                          local.tee 1
                          i32.load offset=116
                          i32.eqz
                          if  ;; label = @12
                            local.get 1
                            call 600
                          end
                          i32.const 5623260
                          call 602
                          i32.load offset=92
                          i32.load8_u offset=1001
                          i32.eqz
                          br_if 7 (;@4;)
                          i32.const 5625568
                          call 602
                          local.tee 1
                          i32.load offset=116
                          i32.eqz
                          if  ;; label = @12
                            local.get 1
                            call 600
                          end
                          i32.const 5634068
                          call 602
                          local.tee 1
                          i32.load offset=116
                          i32.eqz
                          if  ;; label = @12
                            local.get 1
                            call 600
                          end
                          i32.const 0
                          call 4659
                          br 3 (;@8;)
                        end
                        i32.const 4
                        call 14
                        local.tee 0
                        local.get 1
                        i32.load
                        i32.store
                        i32.const 6236660
                        i32.const 0
                        i32.store
                        i32.const 327
                        local.get 0
                        i32.const 4837720
                        i32.const 0
                        call 5
                        i32.const 6236660
                        i32.load
                        local.set 0
                        i32.const 6236660
                        i32.const 0
                        i32.store
                        local.get 0
                        i32.const 1
                        i32.ne
                        br_if 8 (;@2;)
                      end
                      call 8
                      local.set 5
                      call 1
                      drop
                      i32.const 6236660
                      i32.const 0
                      i32.store
                      i32.const 58
                      call 4
                      i32.const 6236660
                      i32.load
                      local.set 0
                      i32.const 6236660
                      i32.const 0
                      i32.store
                      local.get 0
                      i32.const 1
                      i32.eq
                      br_if 6 (;@3;)
                    end
                    local.get 5
                    call 11
                    unreachable
                  end
                  local.set 1
                  i32.const 5616484
                  call 602
                  local.tee 2
                  i32.load offset=116
                  i32.eqz
                  if  ;; label = @8
                    local.get 2
                    call 600
                  end
                  i32.const 5670124
                  call 602
                  call 745
                  local.set 2
                  i32.const 5640156
                  call 602
                  local.tee 3
                  i32.load offset=116
                  i32.eqz
                  if  ;; label = @8
                    local.get 3
                    call 600
                  end
                  i32.const 5640156
                  call 602
                  i32.load offset=92
                  i32.load offset=32
                  local.tee 5
                  i32.eqz
                  if  ;; label = @8
                    i32.const 5640156
                    call 602
                    local.tee 3
                    i32.load offset=116
                    i32.eqz
                    if  ;; label = @9
                      local.get 3
                      call 600
                    end
                    i32.const 5640156
                    call 602
                    i32.load offset=92
                    i32.load
                    local.set 3
                    i32.const 5631960
                    call 602
                    call 603
                    local.tee 5
                    local.get 3
                    i32.const 5716052
                    call 602
                    i32.const 0
                    call 790
                    i32.const 5640156
                    call 602
                    i32.load offset=92
                    local.get 5
                    i32.store offset=32
                    i32.const 5640156
                    call 602
                    drop
                  end
                  i32.const 5634068
                  call 602
                  local.tee 3
                  i32.load offset=116
                  i32.eqz
                  if  ;; label = @8
                    local.get 3
                    call 600
                  end
                  local.get 2
                  i32.const 23
                  local.get 5
                  i32.const 0
                  call 49217
                  local.get 0
                  i32.load offset=68
                  i32.const 0
                  call 635
                  local.get 1
                  i32.const 0
                  i32.const 0
                  call 1072
                  i32.const 0
                  i32.const 0
                  i32.const 1
                  i32.const 0
                  call 1098
                  local.get 0
                  i32.const 1
                  i32.store8 offset=81
                  br 3 (;@4;)
                end
                i32.const 5669844
                i32.load
                call 644
                local.set 7
                local.get 0
                i32.load offset=68
                local.set 8
                i32.const 5623260
                i32.load
                local.tee 9
                i32.load offset=116
                i32.eqz
                if  ;; label = @7
                  local.get 9
                  call 600
                end
                local.get 7
                local.get 8
                i32.const 0
                call 12586
                local.get 5
                local.get 3
                local.get 1
                local.get 2
                f32.const -0x1p+0 (;=-1;)
                i32.const 0
                call 6414
              end
              local.get 0
              i32.load offset=12
              local.set 1
              i32.const 5625616
              i32.load
              local.tee 2
              i32.load offset=116
              i32.eqz
              if  ;; label = @6
                local.get 2
                call 600
              end
              local.get 0
              local.get 1
              i32.const 0
              call 1526
              i32.const 5690436
              i32.load
              call 2114
              i32.store offset=16
            end
            local.get 0
            i32.load offset=72
            local.get 4
            i32.const 5673040
            i32.load
            call 2404
          end
          local.get 6
          i32.const 32
          i32.add
          global.set 0
          return
        end
        i32.const 0
        call 0
        drop
        call 1
        drop
        call 617
      end
      unreachable
    end
    call 632
    i32.const 0
    call 606
    unreachable)
