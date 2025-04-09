package com.dev.truongdev.xdevbase.service.impl;

import com.dev.truongdev.utils.AppConstants;
import com.dev.truongdev.xdevbase.entity.XDevBaseEntity;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.BeanUtils;

@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
public class XDevBaseServiceImpl <
    E extends XDevBaseEntity, R extends XDevBaseRepo<E>>
    implements IXDevBaseService<E> {
  final R repo;

  public void setBaseEntity (E e, Long cid, String uid){
    e.setCompanyId(cid);
    e.setCreateBy(Optional.ofNullable(e.getCreateBy()).orElse(uid));
    e.setUpdateBy(uid);
    e.setStatus(AppConstants.STATUS_ACTIVE);
  }

  @Override
  @Transactional
  public E create(Long cid, String uid, E e){
    setBaseEntity(e, cid, uid);
    return repo.save(e);
  }

  @Override
  @Transactional
  public E update(Long cid, String uid, E e , Long id){
    E data = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("data_not_found"));
    BeanUtils.copyProperties(e, data, "id", "companyId" ,"createBy", "version", "createDate", "modifiedDate");
    data.setUpdateBy(uid);
    return repo.save(data);
  }

  @Override
  public void delete(Long cid, String uid, Long id) {
    repo.deleteById(id);
  }

  @Override
  public void changeStatus(Long cid, String uid, Long id) {
    E entity = repo
        .findByCompanyIdAndId(cid, id)
        .orElseThrow(() -> new RuntimeException("Entity not found"));
    if (!Objects.equals(entity.getStatus(), AppConstants.STATUS_ACTIVE)) {
      throw new RuntimeException("delete_allow_status_new");
    }
    entity.setStatus(AppConstants.STATUS_INACTIVE);
    repo.save(entity);
  }

  @Override
  public List<E> getAll(Long cid, String uid) {
    return repo.findAllByCompanyIdAndStatus(cid, AppConstants.STATUS_ACTIVE);
  }
}
